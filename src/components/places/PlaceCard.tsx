import React, { useState } from 'react';
import { Star, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { Place } from '../../types/place';

interface PlaceCardProps {
  place: Place;
  onSelectPlace?: (place: Place) => void;
}

// Badges translúcidos refinados estilo iOS con efecto Vibrancy
const getPriceBadgeStyle = (level: string) => {
  const normalized = level.toLowerCase().trim();

  if (normalized.includes('libre') || normalized.includes('gratis')) {
    return 'bg-emerald-500/90 text-white border-emerald-400/40 shadow-emerald-900/10';
  }
  if (normalized.includes('económico') || normalized.includes('economico')) {
    return 'bg-teal-600/90 text-white border-teal-400/40 shadow-teal-900/10';
  }
  if (normalized.includes('moderado')) {
    return 'bg-blue-600/90 text-white border-blue-400/40 shadow-blue-900/10';
  }
  if (normalized.includes('prémium') || normalized.includes('premium')) {
    return 'bg-purple-600/90 text-white border-purple-400/40 shadow-purple-900/10';
  }

  return 'bg-slate-900/90 text-white border-slate-700/40';
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onSelectPlace }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayImage = imageError
    ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    : place.imageUrl;

  const priceBadgeClass = getPriceBadgeStyle(place.priceLevel);

  return (
    <article
      onClick={() => onSelectPlace?.(place)}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-black/[0.04] shadow-sm transition-transform duration-100 ease-out cursor-pointer active:scale-[0.97] select-none ${
        place.isFeatured
          ? 'ring-1 ring-amber-400/50 shadow-md shadow-amber-500/5'
          : 'hover:border-black/[0.08]'
      }`}
    >
      {/* Contenedor de Imagen con radio y proporción óptica */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse" />
        )}

        <img
          src={displayImage}
          alt={place.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradiente sutil para legibilidad de badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Barra superior de badges: alineación perfecta en altura h-6 */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {/* Badge izquierdo: ★ Recomendado o Categoría */}
          <div>
            {place.isFeatured ? (
              <span className="h-6 inline-flex items-center gap-1 px-2.5 rounded-full text-[11px] font-bold bg-amber-500/95 backdrop-blur-md text-white shadow-xs tracking-wide">
                <Sparkles className="w-3 h-3 fill-white" />
                <span>★ Recomendado</span>
              </span>
            ) : (
              <span className="h-6 inline-flex items-center px-2.5 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white shadow-xs">
                {place.category}
              </span>
            )}
          </div>

          {/* Badge derecho: Nivel de precio con idéntica altura (h-6) */}
          <div>
            <span
              className={`h-6 inline-flex items-center px-2.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-xs backdrop-blur-md ${priceBadgeClass}`}
            >
              {place.priceLevel}
            </span>
          </div>
        </div>

        {/* Información superpuesta inferior sobre la imagen (Municipio y Calificación) */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-white text-xs">
          <span className="inline-flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px]">
            <MapPin className="w-3 h-3 text-amber-300" />
            {place.municipality}
          </span>

          <span className="inline-flex items-center gap-1 font-bold bg-amber-500/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px]">
            <Star className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
            <span className="tabular-nums">{place.rating.toFixed(1)}</span>
          </span>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-slate-900 leading-tight tracking-tight group-hover:text-amber-600 transition-colors">
              {place.name}
            </h3>
            {place.isFeatured && (
              <span className="shrink-0 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md">
                Top Plan
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed tracking-normal font-normal">
            {place.shortDescription}
          </p>

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {place.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer de la tarjeta con acción rápida */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-600 flex items-center gap-0.5">
            Ver detalles y cómo llegar
          </span>
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
};
