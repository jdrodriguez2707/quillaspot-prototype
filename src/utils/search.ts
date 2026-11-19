import { Place } from '../types/place';
import { normalizeText } from './text';

const SEARCH_STOP_WORDS = new Set<string>([
  'de',
  'del',
  'la',
  'las',
  'el',
  'los',
  'en',
  'con',
  'para',
  'por',
  'al',
  'y',
  'o',
  'un',
  'una',
  'unos',
  'unas',
]);

const SYNONYM_MAP: Record<string, string[]> = {
  gratis: ['entrada libre', 'gratuita'],
  gratuito: ['entrada libre', 'gratuita'],
  gratuita: ['entrada libre'],
  barato: ['plan barato', 'economico', 'entrada libre'],
  barata: ['plan barato', 'economico', 'entrada libre'],
  baratos: ['plan barato', 'economico', 'entrada libre'],
  baratas: ['plan barato', 'economico', 'entrada libre'],
  economico: ['plan barato', 'economico'],
  economica: ['plan barato', 'economico'],
  economicos: ['plan barato', 'economico'],
  presupuesto: ['plan barato', 'economico', 'moderado'],
  premium: ['premium'],
  lujo: ['premium'],
  elegante: ['premium'],
  romantico: ['en pareja'],
  romantica: ['en pareja'],
  novio: ['en pareja'],
  novia: ['en pareja'],
  novios: ['en pareja'],
  cita: ['en pareja'],
  citas: ['en pareja'],
  pareja: ['en pareja'],
  familia: ['en familia', 'familiar'],
  familiar: ['en familia', 'familiar'],
  ninos: ['en familia', 'familiar'],
  ninas: ['en familia', 'familiar'],
  hijos: ['en familia', 'familiar'],
  amigos: ['con amigos'],
  amigo: ['con amigos'],
  parche: ['con amigos'],
  parchar: ['con amigos'],
  grupo: ['con amigos'],
  mascota: ['pet friendly'],
  mascotas: ['pet friendly'],
  perro: ['pet friendly', 'perros'],
  perrito: ['pet friendly'],
  pet: ['pet friendly'],
  naturaleza: ['ecoturismo', 'al aire libre'],
  ecologico: ['ecoturismo', 'al aire libre'],
  ecoturismo: ['ecoturismo', 'al aire libre'],
  aire: ['al aire libre'],
  libre: ['al aire libre', 'entrada libre'],
  mar: ['vista al mar', 'playa', 'caribe'],
  playa: ['playa', 'vista al mar'],
  brisa: ['al aire libre', 'vista al mar', 'malecon'],
  rio: ['vista al rio', 'malecon'],
  noche: ['nocturno'],
  nocturno: ['nocturno'],
  nocturna: ['nocturno'],
  cena: ['nocturno', 'gastronomia'],
  tarde: ['tardeo', 'atardecer'],
  tardear: ['tardeo', 'atardecer'],
  dulce: ['postres', 'helados', 'waffles', 'malteadas'],
  postre: ['postres', 'helados'],
  comida: ['gastronomia', 'comida'],
  comer: ['gastronomia', 'comida', 'restaurante'],
  restaurante: ['gastronomia', 'restaurante'],
  quilla: ['barranquilla'],
  pueblo: ['pueblo patrimonio', 'usiacuri', 'puerto colombia'],
  pueblos: ['pueblo patrimonio', 'usiacuri', 'puerto colombia'],
};

const sanitizeForSearch = (value: string | null | undefined): string => {
  return normalizeText(value)
    .replace(/[#.,;:!?()[\]"'¡¿/\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const tokenizeSearchQuery = (query: string): string[] => {
  const cleaned = sanitizeForSearch(query);
  if (!cleaned) return [];

  const rawTokens = cleaned.split(' ').filter(Boolean);
  const meaningful = rawTokens.filter((token) => !SEARCH_STOP_WORDS.has(token));

  return meaningful.length > 0 ? meaningful : rawTokens;
};

const getTokenVariants = (token: string): string[] => {
  const variants = new Set<string>([token]);

  // Singularización simple para plurales frecuentes en español (evita cortar palabras terminadas en -is como "gratis")
  if (token.length > 4 && token.endsWith('s') && !token.endsWith('is')) {
    variants.add(token.slice(0, -1));
  }
  if (token.length > 5 && token.endsWith('es') && !token.endsWith('ies')) {
    variants.add(token.slice(0, -2));
  }

  const synonyms = SYNONYM_MAP[token];
  if (synonyms) {
    synonyms.forEach((syn) => variants.add(syn));
  }

  return Array.from(variants);
};

interface WeightedField {
  text: string;
  words: string[];
  weight: number;
}

const matchesVariantInField = (field: WeightedField, variant: string, isOriginalToken: boolean): boolean => {
  if (!field.text) return false;

  // Frase multi-palabra (ej. "entrada libre", "en pareja", "pet friendly")
  if (variant.includes(' ')) {
    return ` ${field.text} `.includes(` ${variant} `);
  }

  // Coincidencia desde el inicio de palabra (soporta búsqueda en vivo mientras escribe y evita falsos positivos como "mar" en "miramar")
  if (field.words.some((word) => word.startsWith(variant))) {
    return true;
  }

  // Respaldo para palabras largas (ej. "barranquillero" al buscar "quillero") solo sobre el término literal
  if (isOriginalToken && variant.length >= 5) {
    return field.text.includes(variant);
  }

  return false;
};

/**
 * Evalúa si un lugar coincide con todos los tokens de búsqueda y calcula su puntaje de relevancia.
 * Retorna 0 si no coincide; > 0 si cumple todos los términos.
 */
export const getPlaceSearchScore = (place: Place, query: string): number => {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return 1;

  const toField = (raw: string, weight: number): WeightedField => {
    const text = sanitizeForSearch(raw);
    return {
      text,
      words: text ? text.split(' ') : [],
      weight,
    };
  };

  const nameField = toField(place.name, 100);
  const tagsField = toField((place.tags ?? []).join(' '), 75);
  const moodsField = toField(place.moods.join(' '), 70);
  const geoAndCategoryField = toField(`${place.municipality} ${place.category}`, 60);
  const locationAndPriceField = toField(
    `${place.address ?? ''} ${place.priceLevel} ${place.priceDetail ?? ''}`,
    45
  );
  const shortDescField = toField(place.shortDescription, 25);
  const fullDescField = toField(place.fullDescription ?? '', 15);

  const fields: WeightedField[] = [
    nameField,
    tagsField,
    moodsField,
    geoAndCategoryField,
    locationAndPriceField,
    shortDescField,
    fullDescField,
  ];

  let totalScore = 0;

  for (const token of tokens) {
    const variants = getTokenVariants(token);
    let bestTokenScore = 0;

    for (const field of fields) {
      if (!field.text) continue;
      for (const variant of variants) {
        const isOriginal = variant === token;
        if (matchesVariantInField(field, variant, isOriginal)) {
          const exactBonus = isOriginal ? 5 : 0;
          const candidateScore = field.weight + exactBonus;
          if (candidateScore > bestTokenScore) {
            bestTokenScore = candidateScore;
          }
        }
      }
    }

    // Coincidencia estricta tipo AND: todos los términos relevantes deben aparecer en algún campo
    if (bestTokenScore === 0) {
      return 0;
    }

    totalScore += bestTokenScore;
  }

  // Bonus adicional si la frase completa aparece literal en el nombre, tags o moods
  const fullPhrase = tokens.join(' ');
  if (fullPhrase.length > 2) {
    if (nameField.text.includes(fullPhrase)) totalScore += 40;
    if (tagsField.text.includes(fullPhrase)) totalScore += 30;
    if (moodsField.text.includes(fullPhrase)) totalScore += 25;
  }

  return totalScore;
};
