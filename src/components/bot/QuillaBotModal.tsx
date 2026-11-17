import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import {
  X,
  Sparkles,
  Send,
  MapPin,
  Star,
  Plus,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  Place,
  QuillaBotErrorResponse,
  QuillaBotResponse,
} from '../../types/place';
import { iosSpringDefault, iosSpringMomentum } from '../../utils/physics';

interface QuillaBotModalProps {
  catalog: Place[];
  isPlaceInPlan: (placeId: string) => boolean;
  onTogglePlan: (place: Place) => void;
  onSelectPlace: (place: Place) => void;
  onClose: () => void;
}

const QUICK_PROMPTS: string[] = [
  'Cita en pareja al atardecer',
  'Comida rica y barata con amigos',
  'Plan familiar al aire libre',
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';

const getPriceBadgeStyle = (level: string) => {
  const normalized = level.toLowerCase().trim();
  if (normalized.includes('libre') || normalized.includes('gratis')) {
    return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20';
  }
  if (normalized.includes('económico') || normalized.includes('economico')) {
    return 'bg-teal-500/15 text-teal-700 border-teal-500/20';
  }
  if (normalized.includes('moderado')) {
    return 'bg-blue-500/15 text-blue-700 border-blue-500/20';
  }
  if (normalized.includes('prémium') || normalized.includes('premium')) {
    return 'bg-purple-500/15 text-purple-700 border-purple-500/20';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const QuillaBotModal: React.FC<QuillaBotModalProps> = ({
  catalog,
  isPlaceInPlan,
  onTogglePlan,
  onSelectPlace,
  onClose,
}) => {
  const [query, setQuery] = useState<string>('');
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [botResponse, setBotResponse] = useState<QuillaBotResponse | null>(null);
  const [errorState, setErrorState] = useState<QuillaBotErrorResponse | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Bloqueo de scroll sin reflow
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    return () => {
      if (!document.querySelector('[role="dialog"]')) {
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      }
    };
  }, []);

  // Soporte de tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const shouldDismiss = info.offset.y > 70 || info.velocity.y > 250;
    if (shouldDismiss) {
      onClose();
    }
  };

  // Lugares recomendados validados contra el catálogo real
  const recommendedPlaces = useMemo(() => {
    if (!botResponse) return [];
    const catalogMap = new Map<string, Place>(
      catalog.map((place) => [place.id, place])
    );
    return botResponse.recommendedPlaceIds
      .map((id) => catalogMap.get(id))
      .filter((place): place is Place => Boolean(place))
      .slice(0, 3);
  }, [botResponse, catalog]);

  // Sugerencias de respaldo del catálogo si ocurre un error de red o configuración
  const defaultCatalogSuggestions = useMemo(() => {
    return catalog
      .filter((place) => place.isFeatured)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2);
  }, [catalog]);

  const submitPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    setQuery(trimmed);
    setLastSubmittedQuery(trimmed);
    setIsLoading(true);
    setErrorState(null);
    setBotResponse(null);

    try {
      const res = await fetch('/api/quillabot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const errPayload = data as QuillaBotErrorResponse | null;
        setErrorState({
          error:
            errPayload?.error ||
            'No pudimos conectar con QuillaBot en este momento. Intenta de nuevo en unos segundos.',
          code: errPayload?.code || 'UPSTREAM_ERROR',
        });
        return;
      }

      const parsed = data as QuillaBotResponse | null;
      if (
        !parsed ||
        typeof parsed.message !== 'string' ||
        !Array.isArray(parsed.recommendedPlaceIds)
      ) {
        setErrorState({
          error: 'Recibimos una respuesta inesperada del asistente. Intenta otra consulta.',
          code: 'UPSTREAM_ERROR',
        });
        return;
      }

      setBotResponse(parsed);
    } catch {
      setErrorState({
        error:
          'Sin conexión con el servidor de QuillaBot. Verifica tu red e intenta nuevamente.',
        code: 'NETWORK_ERROR',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitPrompt(query);
  };

  const handleReset = () => {
    setQuery('');
    setLastSubmittedQuery('');
    setBotResponse(null);
    setErrorState(null);
    inputRef.current?.focus();
  };

  const renderCompactPlaceCard = (place: Place) => {
    const inPlan = isPlaceInPlan(place.id);
    const imgSrc = failedImages[place.id] ? FALLBACK_IMAGE : place.imageUrl;

    return (
      <div
        key={place.id}
        onClick={() => onSelectPlace(place)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectPlace(place);
          }
        }}
        className="group bg-white rounded-2xl p-2.5 border border-black/[0.05] shadow-2xs hover:border-amber-300/80 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all duration-100 ease-out"
      >
        <img
          src={imgSrc}
          alt={place.name}
          onError={() =>
            setFailedImages((prev) => ({ ...prev, [place.id]: true }))
          }
          className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
              {place.name}
            </h4>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 shrink-0 tabular-nums">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {place.rating.toFixed(1)}
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{place.municipality}</span>
          </p>

          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriceBadgeStyle(
                place.priceLevel
              )}`}
            >
              <span>$</span>
              <span>{place.priceLevel}</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 truncate">
              {place.category}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlan(place);
          }}
          aria-label={
            inPlan
              ? `Quitar ${place.name} de tu plan`
              : `Agregar ${place.name} a tu plan`
          }
          aria-pressed={inPlan}
          title={inPlan ? 'En tu plan (toca para quitar)' : 'Agregar a tu plan'}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-100 ease-out active:scale-90 cursor-pointer shrink-0 ${
            inPlan
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {inPlan ? (
            <Check className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Plus className="w-4 h-4 stroke-[2.25]" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pt-[72px] sm:pt-20 p-0 sm:p-4 md:p-6">
      {/* Backdrop Scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Fluid Bottom Sheet / Modal */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-quillabot-title"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={iosSpringMomentum}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
        className="relative z-10 w-full max-w-md sm:max-w-lg bg-[#F2F2F7] rounded-t-[32px] sm:rounded-3xl max-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden shadow-2xl border-t sm:border border-white/60 touch-pan-y will-change-transform transform-gpu"
      >
        {/* Cabecera estilo iOS */}
        <div className="bg-white/85 backdrop-blur-xl border-b border-black/[0.06] px-5 pt-3 pb-4 shrink-0">
          {/* iOS Grab Handle en móvil */}
          <div className="flex sm:hidden justify-center items-center pb-2.5">
            <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm relative shrink-0 overflow-hidden">
                <img
                  src="/assets/logo-quillaspot.png"
                  alt="QuillaBot"
                  className="w-7 h-7 object-contain"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-white">
                  <Sparkles className="w-2.5 h-2.5 text-slate-950" />
                </span>
              </div>
              <div>
                <h2
                  id="modal-quillabot-title"
                  className="text-base sm:text-lg font-bold tracking-[-0.02em] text-slate-900 leading-tight"
                >
                  QuillaBot
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-snug">
                  Tu consejero de planes en el Atlántico
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {(botResponse || errorState) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform duration-100 ease-out active:scale-95 cursor-pointer"
                  aria-label="Nueva consulta"
                  title="Nueva consulta"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-transform duration-100 ease-out active:scale-95 cursor-pointer"
                aria-label="Cerrar QuillaBot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Píldoras de sugerencias rápidas */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Sugerencias rápidas
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void submitPrompt(promptText)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 border border-black/[0.06] hover:border-amber-300/70 text-xs font-semibold text-slate-700 shadow-2xs transition-all duration-100 ease-out active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mensaje inicial si aún no hay consulta */}
          {!isLoading && !botResponse && !errorState && (
            <div className="bg-white rounded-2xl p-4 border border-black/[0.04] shadow-2xs">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ¡Qué más, llave! Cuéntame con quién sales, qué se te antoja o tu presupuesto y te recomiendo los mejores spots reales del catálogo en Barranquilla y el Atlántico.
              </p>
            </div>
          )}

          {/* Burbuja de consulta enviada */}
          {lastSubmittedQuery && (isLoading || botResponse || errorState) && (
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-slate-900 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-xs sm:text-sm font-medium shadow-xs">
                {lastSubmittedQuery}
              </div>
            </div>
          )}

          {/* Estado de carga (Skeleton / Pulse estilo iOS) */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={iosSpringDefault}
              className="space-y-3"
            >
              <div className="bg-white rounded-2xl p-4 border border-black/[0.04] shadow-2xs space-y-2 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-200/80" />
                  <div className="h-3 w-24 bg-slate-200 rounded-full" />
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full" />
                <div className="h-3 w-4/5 bg-slate-200 rounded-full" />
              </div>

              <div className="bg-white rounded-2xl p-3 border border-black/[0.04] flex items-center gap-3 animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 bg-slate-200 rounded-full" />
                  <div className="h-3 w-1/2 bg-slate-200 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Respuesta de QuillaBot + Tarjetas recomendadas */}
          {!isLoading && botResponse && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={iosSpringDefault}
              className="space-y-3"
            >
              {/* Globo de chat de QuillaBot */}
              <div className="bg-white rounded-2xl rounded-bl-md p-4 border border-black/[0.05] shadow-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recomendación QuillaBot</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {botResponse.message}
                </p>
              </div>

              {/* Tarjetas compactas de lugares recomendados */}
              {recommendedPlaces.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Lugares sugeridos ({recommendedPlaces.length})
                  </span>
                  <div className="space-y-2">
                    {recommendedPlaces.map((place) =>
                      renderCompactPlaceCard(place)
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Manejo de error resiliente sin romper la experiencia */}
          {!isLoading && errorState && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={iosSpringDefault}
              className="space-y-3"
            >
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs leading-relaxed">
                  <p className="font-bold">
                    {errorState.code === 'MISSING_API_KEY'
                      ? 'Asistente pendiente de configuración'
                      : 'No pudimos obtener la recomendación de IA'}
                  </p>
                  <p className="text-amber-900/90">{errorState.error}</p>
                </div>
              </div>

              {defaultCatalogSuggestions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Mientras tanto, destacados del catálogo
                  </span>
                  <div className="space-y-2">
                    {defaultCatalogSuggestions.map((place) =>
                      renderCompactPlaceCard(place)
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Caja de entrada fija en la parte inferior */}
        <form
          onSubmit={handleFormSubmit}
          className="p-3.5 sm:p-4 bg-white/90 backdrop-blur-xl border-t border-black/[0.06] shrink-0"
        >
          <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1.5 pl-4 border border-black/[0.04] focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/30 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Plan barato para comer hoy con amigos..."
              maxLength={300}
              disabled={isLoading}
              aria-label="Escribe qué plan buscas"
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden min-w-0"
            />
            <button
              type="submit"
              disabled={isLoading || query.trim().length === 0}
              aria-label="Enviar consulta a QuillaBot"
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center transition-transform duration-100 ease-out active:scale-90 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
