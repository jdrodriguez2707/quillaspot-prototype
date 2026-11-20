import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Place } from '../../types/place';
import { iosSpringSnappy } from '../../utils/physics';

interface PlanBarProps {
  plan: Place[];
  lastAddedAt?: number | null;
  onNavigatePlan: () => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';

export const PlanBar: React.FC<PlanBarProps> = ({
  plan,
  lastAddedAt,
  onNavigatePlan,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Solo se muestra cuando efectivamente se agrega un lugar nuevo al plan (no al recargar la página)
  useEffect(() => {
    if (!lastAddedAt || plan.length === 0) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = window.setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [lastAddedAt, plan.length]);

  if (plan.length === 0 || !isVisible) return null;

  const placeLabel = plan.length === 1 ? 'lugar' : 'lugares';

  return (
    <AnimatePresence>
      <div className="fixed bottom-[82px] inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.95 }}
          transition={iosSpringSnappy}
          className="pointer-events-auto max-w-full bg-slate-900/90 backdrop-blur-xl text-white pl-3.5 pr-2.5 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-2xl flex items-center gap-3 sm:gap-4 border border-white/10"
        >
          {/* Miniaturas apiladas de los lugares elegidos */}
          <div className="flex items-center -space-x-2 shrink-0">
            {plan.map((place) => {
              const src = failedImages[place.id]
                ? FALLBACK_IMAGE
                : place.imageUrl;
              return (
                <img
                  key={place.id}
                  src={src}
                  alt={place.name}
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [place.id]: true }))
                  }
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-slate-900 bg-slate-800"
                />
              );
            })}
          </div>

          {/* Contador dinámico */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap tabular-nums">
              Tu Plan ({plan.length} {placeLabel})
            </span>
            <span className="text-[10px] text-slate-300 hidden sm:block leading-none">
              Máximo 4 paradas
            </span>
          </div>

          {/* Botón de acción con texto 'Ver >' */}
          <button
            type="button"
            onClick={onNavigatePlan}
            className="shrink-0 inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm transition-transform duration-100 ease-out active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>Ver</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
