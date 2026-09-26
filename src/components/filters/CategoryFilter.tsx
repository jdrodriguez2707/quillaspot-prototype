import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Trees, Landmark, Compass } from 'lucide-react';
import { PlaceCategory } from '../../types/place';
import { iosSpringSnappy } from '../../utils/physics';

interface CategoryFilterProps {
  categories: PlaceCategory[];
  selectedCategory: PlaceCategory;
  onSelectCategory: (category: PlaceCategory) => void;
  categoryCounts: Record<string, number>;
}

// Iconografía refinada de iOS
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
      {/* Scroll táctil horizontal en móviles y flex envolvente limpio en desktop/tablet */}
      <div className="flex items-center md:justify-end gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] ?? 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`relative shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer select-none active:scale-[0.96] transition-transform duration-100 ease-out ${
                isSelected
                  ? 'text-white'
                  : 'bg-white/80 text-slate-600 border border-black/[0.04] backdrop-blur-md shadow-2xs hover:bg-white'
              }`}
            >
              {/* Indicador con resorte iOS layoutId animado */}
              {isSelected && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-slate-900 rounded-full shadow-sm shadow-slate-900/20"
                  transition={iosSpringSnappy}
                />
              )}

              {/* Contenido sobre el indicador */}
              <span className="relative z-10 flex items-center gap-1.5">
                <span className={isSelected ? 'text-amber-400' : 'text-slate-400'}>
                  {getCategoryIcon(cat)}
                </span>
                <span className="tracking-tight">{cat}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-black/[0.05] text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
