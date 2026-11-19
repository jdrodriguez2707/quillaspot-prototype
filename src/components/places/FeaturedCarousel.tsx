import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react';
import { Place } from '../../types/place';

interface FeaturedCarouselProps {
  places: Place[];
  isPlaceInPlan: (placeId: string) => boolean;
  onTogglePlan: (place: Place) => void;
  onSelectPlace: (place: Place) => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  places,
  isPlaceInPlan,
  onTogglePlan,
  onSelectPlace,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(places.length > 1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScrollLeft - el.scrollLeft > 8);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [updateScrollButtons, places.length]);

  const handleScrollBy = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const step = Math.min(316, Math.round(el.clientWidth * 0.75));
    el.scrollBy({
      left: direction === 'right' ? step : -step,
      behavior: 'smooth',
    });
  };

  if (places.length === 0) return null;

  return (
    <section aria-label="Lugares destacados" className="flex flex-col gap-3">
      {/* Encabezado estilo iOS Group Header con controles discretos para desktop */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
            Destacados
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScrollBy('left')}
            disabled={!canScrollLeft}
            aria-label="Desplazar destacados a la izquierda"
            className="w-7 h-7 rounded-full bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-35 disabled:pointer-events-none transition-all duration-100 ease-out active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScrollBy('right')}
            disabled={!canScrollRight}
            aria-label="Desplazar destacados a la derecha"
            className="w-7 h-7 rounded-full bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-35 disabled:pointer-events-none transition-all duration-100 ease-out active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carril horizontal fluido con scroll-snap (sin auto-scroll invasivo) */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollButtons}
        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth scroll-pl-4 sm:scroll-pl-0 no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {places.map((place) => {
          const inPlan = isPlaceInPlan(place.id);
          const displayImage = failedImages[place.id]
            ? FALLBACK_IMAGE
            : place.imageUrl;

          return (
            <article
              key={place.id}
              onClick={() => onSelectPlace(place)}
              className="group relative w-[80%] max-w-[288px] sm:w-[292px] sm:max-w-none h-[196px] sm:h-[208px] shrink-0 snap-start rounded-2xl overflow-hidden bg-slate-900 border-[1.5px] border-amber-500/70 shadow-sm cursor-pointer active:scale-[0.97] transition-transform duration-100 ease-out select-none"
            >
              <img
                src={displayImage}
                alt={place.name}
                loading="lazy"
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [place.id]: true }))
                }
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradiente para alto contraste en badges y texto editorial */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/25 pointer-events-none" />

              {/* Barra superior: Rating + Botón rápido Al Plan */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-end gap-2 pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="h-6 inline-flex items-center gap-1 px-2 rounded-full text-[11px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/15 tabular-nums">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span>{place.rating.toFixed(1)}</span>
                  </span>

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
                    title={
                      inPlan
                        ? 'En tu plan (toca para quitar)'
                        : 'Agregar a tu plan'
                    }
                    className={`pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center transition-all duration-100 ease-out active:scale-90 cursor-pointer shrink-0 ${
                      inPlan
                        ? 'bg-slate-900 text-white shadow-md border border-white/25'
                        : 'bg-white/85 backdrop-blur-md text-slate-800 hover:bg-white shadow-xs'
                    }`}
                  >
                    {inPlan ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 stroke-[2.25]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Contenido editorial inferior sobre la imagen */}
              <div className="absolute bottom-3 inset-x-3 flex flex-col gap-1 pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-200 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                    <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[130px]">{place.municipality}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-white/90 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 truncate">
                    {place.priceLevel}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-tight tracking-tight truncate group-hover:text-amber-300 transition-colors">
                  {place.name}
                </h3>

                <p className="text-xs text-white/80 leading-snug line-clamp-1 font-normal">
                  {place.shortDescription}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
