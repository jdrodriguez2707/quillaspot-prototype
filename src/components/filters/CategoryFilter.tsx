import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { PlaceCategory } from '../../types/place';
import { iosSpringSnappy } from '../../utils/physics';
import { getCategoryIcon } from '../../utils/filterIcons';

interface CategoryFilterProps {
  categories: PlaceCategory[];
  selectedCategory: PlaceCategory;
  onSelectCategory: (category: PlaceCategory) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (
    cat: PlaceCategory,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    onSelectCategory(cat);

    const container = scrollContainerRef.current;
    const button = e.currentTarget;
    if (container && container.scrollWidth > container.clientWidth) {
      const targetLeft =
        button.offsetLeft - (container.clientWidth - button.offsetWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full">
      {/* Scroll táctil horizontal en móviles y flex envolvente limpio en desktop/tablet */}
      <div
        ref={scrollContainerRef}
        className="relative flex items-center md:justify-end gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth"
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] ?? 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={(e) => handleSelect(cat, e)}
              className={`relative shrink-0 whitespace-nowrap inline-flex items-center h-9 px-3.5 rounded-full text-xs font-semibold cursor-pointer select-none active:scale-[0.96] transition-transform duration-100 ease-out ${
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
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums leading-none ${
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
