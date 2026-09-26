import React, { useState } from 'react';
import { Star, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { Place } from '../../types/place';

interface PlaceCardProps {
  place: Place;
  onSelectPlace?: (place: Place) => void;
}

// Función auxiliar para asignar estilos y colores armónicos por nivel de precio
const getPriceBadgeStyle = (level: string) => {
  const normalized = level.toLowerCase().trim();

  if (normalized.includes('libre') || normalized.includes('gratis')) {
    return 'bg-emerald-500/95 text-white border-emerald-400/40 shadow-emerald-900/20';
  }
  if (normalized.includes('económico') || normalized.includes('economico')) {
    return 'bg-teal-600/95 text-white border-teal-400/40 shadow-teal-900/20';
  }
  if (normalized.includes('moderado')) {
    return 'bg-blue-600/95 text-white border-blue-400/40 shadow-blue-900/20';
  }
  if (normalized.includes('prémium') || normalized.includes('premium')) {
    return 'bg-purple-600/95 text-white border-purple-400/40 shadow-purple-900/20';
  }

  // Fallback estándar
  return 'bg-zinc-800/95 text-white border-zinc-600/40';
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
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer active:scale-[0.985] ${
        place.isFeatured
          ? 'border-amber-300 ring-1 ring-amber-300/60 shadow-md shadow-amber-500/5'
          : 'border-zinc-200/80 shadow-xs hover:border-zinc-300 hover:shadow-sm'
      }`}
    >
      {/* Contenedor de Imagen con Aspect Ratio móvil óptimo */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-200 animate-pulse" />
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/35 pointer-events-none" />

        {/* Badge superior izquierdo: ★ Recomendado / Categoría */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
          {place.isFeatured ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs tracking-wide">
              <Sparkles className="w-3 h-3 fill-white" />
              <span>★ Recomendado</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/55 backdrop-blur-xs text-white">
              {place.category}
            </span>
          )}
        </div>

        {/* Badge superior derecho: Nivel de precio con color distintivo */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-xs backdrop-blur-xs ${priceBadgeClass}`}
          >
            {place.priceLevel}
          </span>
        </div>

        {/* Información superpuesta inferior sobre la imagen (Municipio y Calificación) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
          <span className="inline-flex items-center gap-1 font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px]">
            <MapPin className="w-3 h-3 text-amber-300" />
            {place.municipality}
          </span>

          <span className="inline-flex items-center gap-1 font-bold bg-amber-500/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px]">
            <Star className="w-3 h-3 fill-yellow-200 text-yellow-200" />
            {place.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-zinc-900 leading-tight group-hover:text-amber-600 transition-colors">
              {place.name}
            </h3>
            {place.isFeatured && (
              <span className="shrink-0 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                Top Plan
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
            {place.shortDescription}
          </p>

          {/* Tags si existen */}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {place.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer de la tarjeta con acción rápida */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-600 flex items-center gap-0.5">
            Ver detalles y mapa
          </span>
          <div className="w-6 h-6 rounded-full bg-zinc-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-zinc-400 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
};
