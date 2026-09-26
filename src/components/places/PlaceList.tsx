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
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-500 mb-2 border border-amber-200">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-zinc-800">No encontramos planes con ese filtro</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
          Prueba con otra palabra clave o explora todas las categorías disponibles.
        </p>
        {hasActiveFilters && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white shadow-2xs hover:bg-amber-600 transition-colors cursor-pointer"
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
    <section className="px-4 flex flex-col gap-4">
      {/* Encabezado del catálogo con indicador de resultados */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold tracking-tight text-zinc-900">
            Planes disponibles
          </h2>
          <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
            {places.length}
          </span>
        </div>

        {featuredCount > 0 && (
          <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            {featuredCount} recomendados
          </span>
        )}
      </div>

      {/* Grid de tarjetas (1 columna en móvil, 2 en pantallas más anchas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
