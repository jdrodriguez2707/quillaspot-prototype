import React from 'react';
import { MoodFilterOption, Place, PlaceCategory } from '../../types/place';
import { PlaceCard } from './PlaceCard';
import { MapPin, RotateCcw } from 'lucide-react';
import { getCategoryIcon, getMoodIcon } from '../../utils/filterIcons';

interface PlaceListProps {
  places: Place[];
  selectedCategory: PlaceCategory;
  selectedMood: MoodFilterOption;
  onSelectPlace?: (place: Place) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const PlaceList: React.FC<PlaceListProps> = ({
  places,
  selectedCategory,
  selectedMood,
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
          Prueba con otra palabra clave, categoría o cambia el mood seleccionado.
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

  const showCategoryIcon = selectedCategory !== 'Todos';
  const showMoodIcon = selectedMood !== 'Todos los planes';

  return (
    <section className="px-0 flex flex-col gap-3.5">
      {/* Encabezado del catálogo estilo iOS Group Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
            Planes recomendados
          </h2>
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-black/[0.05] px-2.5 py-0.5 rounded-full tabular-nums">
            {places.length}
          </span>
        </div>

        {(showCategoryIcon || showMoodIcon) && (
          <div className="flex items-center gap-1.5">
            {showCategoryIcon && (
              <span
                className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-2xs"
                title={selectedCategory}
                aria-label={`Categoría activa: ${selectedCategory}`}
              >
                {getCategoryIcon(selectedCategory)}
              </span>
            )}
            {showMoodIcon && (
              <span
                className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-2xs"
                title={selectedMood}
                aria-label={`Mood activo: ${selectedMood}`}
              >
                {getMoodIcon(selectedMood)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid responsivo: 1 col móvil, 2 cols tablet (sm/md), 3 cols desktop (lg/xl) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
