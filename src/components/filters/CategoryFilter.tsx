import React from 'react';
import { Utensils, Trees, Landmark, Compass } from 'lucide-react';
import { PlaceCategory } from '../../types/place';

interface CategoryFilterProps {
  categories: PlaceCategory[];
  selectedCategory: PlaceCategory;
  onSelectCategory: (category: PlaceCategory) => void;
  categoryCounts: Record<string, number>;
}

// Iconografía contextual según la categoría
const getCategoryIcon = (category: PlaceCategory) => {
  switch (category) {
    case 'Gastronomía':
      return <Utensils className="w-3.5 h-3.5" />;
    case 'Ecoturismo':
      return <Trees className="w-3.5 h-3.5" />;
    case 'Cultura y Ocio':
      return <Landmark className="w-3.5 h-3.5" />;
    default:
      return <Compass className="w-3.5 h-3.5" />;
  }
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="w-full">
      {/* Scroll horizontal fluido con padding táctil Mobile-First */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-4 scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] ?? 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 ring-2 ring-amber-400/40'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-amber-600'}>
                {getCategoryIcon(cat)}
              </span>
              <span>{cat}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
