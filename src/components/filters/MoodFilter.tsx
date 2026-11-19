import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { MoodFilterOption } from '../../types/place';
import { iosSpringSnappy } from '../../utils/physics';
import { getMoodIcon } from '../../utils/filterIcons';

interface MoodFilterProps {
  moods: MoodFilterOption[];
  selectedMood: MoodFilterOption;
  onSelectMood: (mood: MoodFilterOption) => void;
}

export const MoodFilter: React.FC<MoodFilterProps> = ({
  moods,
  selectedMood,
  onSelectMood,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (
    mood: MoodFilterOption,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const nextMood: MoodFilterOption = selectedMood === mood ? 'Todos los planes' : mood;
    onSelectMood(nextMood);

    const container = scrollContainerRef.current;
    const button = e.currentTarget;
    if (nextMood !== 'Todos los planes' && container && container.scrollWidth > container.clientWidth) {
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
      <div
        ref={scrollContainerRef}
        role="group"
        aria-label="Filtrar por ocasión y ambiente"
        className="relative flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth"
      >
        {moods.map((mood) => {
          const isSelected = selectedMood === mood;

          return (
            <button
              key={mood}
              type="button"
              onClick={(e) => handleSelect(mood, e)}
              aria-pressed={isSelected}
              className={`relative shrink-0 whitespace-nowrap inline-flex items-center h-9 px-3.5 rounded-full text-xs font-semibold cursor-pointer select-none active:scale-[0.97] transition-transform duration-100 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
                isSelected
                  ? 'text-white'
                  : 'bg-white/80 text-slate-600 border border-black/[0.04] backdrop-blur-md shadow-2xs hover:bg-white'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeMoodPill"
                  className="absolute inset-0 bg-slate-900 rounded-full shadow-sm shadow-slate-900/20"
                  transition={iosSpringSnappy}
                />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                <span className={isSelected ? 'text-amber-400' : 'text-slate-400'}>
                  {getMoodIcon(mood)}
                </span>
                <span className="tracking-tight">{mood}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
