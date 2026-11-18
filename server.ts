import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import type {
  Place,
  QuillaBotHistoryItem,
  QuillaBotResponse,
} from './src/types/place.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';

const PREFERRED_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-20b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'qwen/qwen3-32b',
  'openai/gpt-oss-120b',
];

const EXCLUDED_MODEL_PATTERNS = [
  'whisper',
  'tts',
  'guard',
  'orpheus',
  'safeguard',
  'distil-whisper',
  'compound',
  'allam',
  'embed',
];

interface GroqModelEntry {
  id?: string;
  active?: boolean;
}

interface GroqModelsResponse {
  data?: GroqModelEntry[];
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

let cachedModels: { ids: string[]; expiresAt: number } | null = null;

const loadCatalog = (): Place[] => {
  const catalogPath = path.resolve(__dirname, 'src/data/places.json');
  const raw = fs.readFileSync(catalogPath, 'utf-8');
  return JSON.parse(raw) as Place[];
};

const getAvailableGroqModels = async (apiKey: string): Promise<string[]> => {
  const now = Date.now();
  if (cachedModels && cachedModels.expiresAt > now) {
    return cachedModels.ids;
  }

  try {
    const res = await fetch(GROQ_MODELS_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return PREFERRED_MODELS;
    }

    const payload = (await res.json().catch(() => null)) as GroqModelsResponse | null;
    const rawIds = (payload?.data ?? [])
      .filter((m) => m.active !== false && typeof m.id === 'string')
      .map((m) => m.id as string)
      .filter(
        (id) =>
          !EXCLUDED_MODEL_PATTERNS.some((pattern) =>
            id.toLowerCase().includes(pattern)
          )
      );

    if (rawIds.length === 0) {
      return PREFERRED_MODELS;
    }

    const availableSet = new Set(rawIds);
    const orderedPreferred = PREFERRED_MODELS.filter((id) => availableSet.has(id));
    const remaining = rawIds.filter((id) => !orderedPreferred.includes(id));
    const combined = [...orderedPreferred, ...remaining];

    cachedModels = {
      ids: combined,
      expiresAt: now + 5 * 60 * 1000,
    };

    console.info(
      `[QuillaBot Groq] Modelos disponibles (${combined.length}): ${combined.slice(0, 8).join(', ')}`
    );

    return combined;
  } catch {
    return PREFERRED_MODELS;
  }
};

const callGroqModel = async (
  apiKey: string,
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  useJsonFormat: boolean
): Promise<{ status: number; ok: boolean; data: GroqChatCompletionResponse | null }> => {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.65,
    max_tokens: 1024,
  };

  if (useJsonFormat) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });

  const data = (await res.json().catch(() => null)) as GroqChatCompletionResponse | null;
  return { status: res.status, ok: res.ok, data };
};

const extractJsonObject = (raw: string): string => {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/quillabot', async (req: Request, res: Response) => {
    const body = req.body as { query?: unknown; history?: unknown } | undefined;
    const rawQuery = body?.query;
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';

    if (!query || query.length > 300) {
      res.status(400).json({
        error: 'Escribe una consulta válida de máximo 300 caracteres.',
        code: 'INVALID_REQUEST',
      });
      return;
    }

    const sanitizedHistory: QuillaBotHistoryItem[] = Array.isArray(body?.history)
      ? body.history
          .filter(
            (item): item is QuillaBotHistoryItem =>
              typeof item === 'object' &&
              item !== null &&
              ((item as { role?: unknown }).role === 'user' ||
                (item as { role?: unknown }).role === 'assistant') &&
              typeof (item as { content?: unknown }).content === 'string' &&
              (item as { content: string }).content.trim().length > 0
          )
          .slice(-4)
          .map((item) => ({
            role: item.role,
            content: item.content.trim().slice(0, 400),
          }))
      : [];

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error:
          'Falta configurar GROQ_API_KEY en las variables de entorno del servidor (Settings > Secrets).',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    try {
      const catalog = loadCatalog();
      const validIds = new Set(catalog.map((place) => place.id));

      const compactCatalog = catalog.map((place) => ({
        id: place.id,
        name: place.name,
        category: place.category,
        municipality: place.municipality,
        priceLevel: place.priceLevel,
        rating: place.rating,
        moods: place.moods,
        tags: place.tags ?? [],
        shortDescription: place.shortDescription,
      }));

      const systemPrompt = [
        'Eres QuillaBot, el asistente local de QuillaSpot para descubrir planes en Barranquilla y el departamento del Atlántico, Colombia.',
        '',
        'PERSONALIDAD Y TONO:',
        '- Habla de forma natural, cercana, cálida y espontánea, con un toque sutil costeño/caribeño (como alguien amable de Barranquilla), pero SIN exagerar ni forzar jerga caricaturesca.',
        '- Puedes usar de vez en cuando expresiones suaves y naturales como "¡Qué más!", "buen parche", "bacano", "por acá" o "brisa", pero máximo 1 por respuesta y solo si fluye bien.',
        '- Sé concreto, claro y útil (máximo 2 a 3 oraciones).',
        '',
        'COMPORTAMIENTO ADAPTATIVO SEGÚN LA INTENCIÓN DEL USUARIO:',
        '1. Si el usuario solo saluda, agradece o hace charla general (ej. "Hola", "Buenas", "¿Cómo estás?", "Gracias", "¿Qué puedes hacer?") SIN pedir todavía un plan o comida específica: responde con calidez y pregúntale de forma natural qué tiene ganas de hacer hoy (con quién sale, qué se le antoja o qué presupuesto maneja). En este caso DEBES devolver "recommendedPlaceIds": [] (arreglo vacío, SIN recomendar lugares todavía).',
        '2. Si el usuario pregunta algo ambiguo o fuera de lugar: respóndele amablemente y oriéntalo a contarte qué tipo de plan busca en Barranquilla o el Atlántico, devolviendo "recommendedPlaceIds": [].',
        '3. Si el usuario SÍ pide una recomendación (por ocasión, comida, presupuesto, lugar o mood, o continúa una conversación previa): recomienda entre 1 y 3 lugares del catálogo explicando brevemente por qué encajan con lo que busca, y devuelve sus IDs exactos en "recommendedPlaceIds".',
        '',
        'REGLA ESTRICTA DE CATÁLOGO:',
        '- SOLO puedes mencionar y devolver lugares cuyo "id" exista literalmente en el catálogo oficial.',
        '- Nunca inventes sitios, precios ni direcciones fuera de este catálogo.',
        '',
        'FORMATO OBLIGATORIO DE SALIDA (únicamente JSON válido):',
        '{"message": "tu respuesta natural", "recommendedPlaceIds": ["id-1", "id-2"]}',
        '',
        'EJEMPLOS DE REFERENCIA:',
        '- Usuario: "Hola" -> {"message": "¡Hola! ¿Qué más? Cuéntame qué tienes ganas de hacer hoy por Barranquilla o el Atlántico: ¿buscas algo rico para comer, un plan en pareja o parche con amigos?", "recommendedPlaceIds": []}',
        '- Usuario: "Cita en pareja al atardecer" -> {"message": "¡Qué buen plan! Para disfrutar la brisa y caer la tarde frente al mar, el Castillo de Salgar tiene una vista espectacular, y el Muelle de Puerto Colombia es ideal para caminar juntos junto a la playa.", "recommendedPlaceIds": ["castillo-de-salgar", "muelle-puerto-colombia"]}',
        '- Usuario: "Gracias" -> {"message": "¡Con todo gusto! Si se te ocurre otro plan o quieres armar tu ruta para el finde, aquí estoy para ayudarte.", "recommendedPlaceIds": []}',
        '',
        `CATÁLOGO OFICIAL DISPONIBLE:\n${JSON.stringify(compactCatalog)}`,
      ].join('\n');

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...sanitizedHistory,
        { role: 'user', content: query },
      ];

      const startedAt = Date.now();
      const availableModels = await getAvailableGroqModels(apiKey);
      const modelsToTry = availableModels.slice(0, 5);
      let finalResult: { status: number; ok: boolean; data: GroqChatCompletionResponse | null } | null = null;
      let usedModel = '';

      for (const model of modelsToTry) {
        let result = await callGroqModel(apiKey, model, messages, true);

        // Si el modelo falla con 400 (ej. no soporta response_format o json_validate_failed), reintentamos sin response_format
        if (!result.ok && result.status === 400) {
          result = await callGroqModel(apiKey, model, messages, false);
        }

        finalResult = result;

        if (result.ok) {
          usedModel = model;
          break;
        }

        if (result.status === 401 || result.status === 403) {
          break;
        }

        const shouldTryNext =
          result.status === 400 ||
          result.status === 404 ||
          result.status === 429 ||
          result.status === 500 ||
          result.status === 502 ||
          result.status === 503;

        if (!shouldTryNext) {
          break;
        }

        console.warn(
          `[QuillaBot Groq] Modelo ${model} respondió ${result.status} (${result.data?.error?.message ?? ''}), probando siguiente modelo...`
        );
      }

      if (!finalResult || !finalResult.ok) {
        const status = finalResult?.status ?? 502;
        const upstreamMessage = finalResult?.data?.error?.message ?? '';
        console.error('[QuillaBot Groq Error]', status, upstreamMessage);

        if (status === 401 || status === 403) {
          res.status(401).json({
            error:
              'La clave GROQ_API_KEY no es válida o no tiene permisos. Verifica la configuración en Settings > Secrets.',
            code: 'UPSTREAM_ERROR',
          });
          return;
        }

        if (status === 429) {
          res.status(429).json({
            error:
              'QuillaBot alcanzó temporalmente el límite de consultas en Groq. Intenta de nuevo en unos segundos.',
            code: 'UPSTREAM_ERROR',
          });
          return;
        }

        res.status(502).json({
          error: `Hubo un inconveniente temporal consultando a Groq (${status}${upstreamMessage ? `: ${upstreamMessage}` : ''}). Intenta nuevamente en unos segundos.`,
          code: 'UPSTREAM_ERROR',
        });
        return;
      }

      const rawContent = (finalResult.data?.choices?.[0]?.message?.content ?? '').trim();
      if (!rawContent) {
        res.status(502).json({
          error: 'QuillaBot no recibió contenido de Groq. Intenta nuevamente.',
          code: 'UPSTREAM_ERROR',
        });
        return;
      }

      const cleanedJson = extractJsonObject(rawContent);
      const parsed = JSON.parse(cleanedJson) as Partial<QuillaBotResponse>;
      const filteredIds = Array.isArray(parsed.recommendedPlaceIds)
        ? Array.from(
            new Set(
              parsed.recommendedPlaceIds.filter(
                (id): id is string => typeof id === 'string' && validIds.has(id)
              )
            )
          ).slice(0, 3)
        : [];

      const message =
        typeof parsed.message === 'string' && parsed.message.trim().length > 0
          ? parsed.message.trim()
          : '¡Aquí tienes unas excelentes opciones del catálogo para disfrutar en el Atlántico!';

      console.info(
        `[QuillaBot Groq] OK | model=${usedModel} | latency=${Date.now() - startedAt}ms | places=${filteredIds.length}`
      );
      if (usedModel) {
        res.setHeader('X-QuillaBot-Model', usedModel);
      }

      res.json({
        message,
        recommendedPlaceIds: filteredIds,
      } satisfies QuillaBotResponse);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.error('[QuillaBot Server Error]', errMessage);
      res.status(502).json({
        error: 'Hubo un inconveniente procesando la recomendación. Intenta nuevamente en unos segundos.',
        code: 'UPSTREAM_ERROR',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const dummyWsServer = http.createServer();
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: { server: dummyWsServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`QuillaSpot server listening on http://${HOST}:${PORT}`);
  });
}

void startServer();
