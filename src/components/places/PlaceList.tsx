import React from 'react';
import { Place } from '../../types/place';
import { PlaceCard } from './PlaceCard';
import { Sparkles, MapPin } from 'lucide-react';

interface PlaceListProps {
  places: Place[];
  onSelectPlace?: (place: Place) => void;
}

export const PlaceList: React.FC<PlaceListProps> = ({ places, onSelectPlace }) => {
  if (places.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 mb-2">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-zinc-800">No encontramos lugares</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Intenta seleccionando otra categoría o limpiando los filtros.
        </p>
      </div>
    );
  }

  // Conteo de destacados para encabezado
  const featuredCount = places.filter((p) => p.isFeatured).length;

  return (
    <section className="px-4 flex flex-col gap-4">
      {/* Encabezado del catálogo con indicador */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold tracking-tight text-zinc-900">
            Planes recomendados
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
