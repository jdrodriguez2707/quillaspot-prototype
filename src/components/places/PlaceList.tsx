import React from 'react';
import { Place } from '../../types/place';
import { PlaceCard } from './PlaceCard';
import { Sparkles, MapPin, RotateCcw } from 'lucide-react';

interface PlaceListProps {
  places: Place[];
  onSelectPlace?: (place: Place) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const PlaceList: React.FC<PlaceListProps> = ({
  places,
  onSelectPlace,
  onResetFilters,
  hasActiveFilters,
}) => {
  if (places.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500 mb-2 border border-black/[0.04]">
          <MapPin className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-900">No encontramos planes con ese filtro</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Prueba con otra palabra clave o explora todas las categorías disponibles.
        </p>
        {hasActiveFilters && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-2xs hover:bg-black transition-transform duration-100 ease-out active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer filtros
          </button>
        )}
      </div>
    );
  }

  // Conteo de destacados dentro del conjunto actualmente filtrado
  const featuredCount = places.filter((p) => p.isFeatured).length;

  return (
    <section className="px-4 flex flex-col gap-3">
      {/* Encabezado del catálogo estilo iOS Group Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Planes recomendados
          </h2>
          <span className="text-[11px] font-bold text-slate-500 bg-black/[0.05] px-2 py-0.2 rounded-full tabular-nums">
            {places.length}
          </span>
        </div>

        {featuredCount > 0 && (
          <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            {featuredCount} destacados
          </span>
        )}
      </div>

      {/* Grid de tarjetas táctiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onSelectPlace={onSelectPlace}
          />
        ))}
      </div>
    </section>
  );
};
