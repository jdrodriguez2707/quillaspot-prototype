import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Place } from '../../types/place';
import { iosSpringMomentum, iosSpringSnappy } from '../../utils/physics';

interface PlanBarProps {
  plan: Place[];
  lastUpdatedAt?: number | null;
  /** Prop mantenido para compatibilidad */
  lastAddedAt?: number | null;
  onNavigatePlan: () => void;
}

type DismissDirection = 'left' | 'right' | 'down';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';

const pillVariants = {
  initial: { opacity: 0, y: 28, scale: 0.95, x: 0 },
  animate: { opacity: 1, y: 0, scale: 1, x: 0, transition: iosSpringSnappy },
  exit: (direction: DismissDirection) => {
    if (direction === 'left') {
      return {
        x: -420,
        opacity: 0,
        scale: 0.94,
        y: 0,
        transition: iosSpringMomentum,
      };
    }
    if (direction === 'right') {
      return {
        x: 420,
        opacity: 0,
        scale: 0.94,
        y: 0,
        transition: iosSpringMomentum,
      };
    }
    return {
      y: 28,
      opacity: 0,
      scale: 0.95,
      x: 0,
      transition: iosSpringSnappy,
    };
  },
};

export const PlanBar: React.FC<PlanBarProps> = ({
  plan,
  lastUpdatedAt,
  lastAddedAt,
  onNavigatePlan,
}) => {
  const triggerTime = lastUpdatedAt ?? lastAddedAt;
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [exitDirection, setExitDirection] = useState<DismissDirection>('down');

  // Se muestra cuando se agrega o quita un lugar (siempre que el plan no quede vacío y no sea carga inicial)
  useEffect(() => {
    if (!triggerTime || plan.length === 0) {
      setIsVisible(false);
      return;
    }

    setExitDirection('down');
    setIsVisible(true);
    const timer = window.setTimeout(() => {
      setExitDirection('down');
      setIsVisible(false);
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [triggerTime, plan.length]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const isDismissRight = info.offset.x > 60 || info.velocity.x > 250;
    const isDismissLeft = info.offset.x < -60 || info.velocity.x < -250;

    if (isDismissRight) {
      setExitDirection('right');
      setIsVisible(false);
      return;
    }

    if (isDismissLeft) {
      setExitDirection('left');
      setIsVisible(false);
      return;
    }
  };

  const placeLabel = plan.length === 1 ? 'lugar' : 'lugares';

  return (
    <AnimatePresence custom={exitDirection}>
      {isVisible && plan.length > 0 && (
        <div className="fixed bottom-[82px] inset-x-0 z-[60] flex justify-center px-4 pointer-events-none overflow-hidden">
          <motion.div
            custom={exitDirection}
            variants={pillVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDragEnd={handleDragEnd}
            className="pointer-events-auto max-w-full bg-slate-900/90 backdrop-blur-xl text-white pl-3.5 pr-2.5 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-2xl flex items-center gap-3 sm:gap-4 border border-white/10 touch-pan-y cursor-grab active:cursor-grabbing select-none will-change-transform transform-gpu"
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
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-slate-900 bg-slate-800 pointer-events-none"
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
      )}
    </AnimatePresence>
  );
};
