import React, { useEffect, useMemo, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import {
  X,
  MapPin,
  ChevronUp,
  ChevronDown,
  Trash2,
  MessageCircle,
  Route,
} from 'lucide-react';
import { Place, PlanMoveDirection } from '../../types/place';
import { iosSpringDefault, iosSpringMomentum } from '../../utils/physics';

interface PlanModalProps {
  plan: Place[];
  onClose: () => void;
  onMovePlace: (index: number, direction: PlanMoveDirection) => void;
  onRemovePlace: (placeId: string) => void;
  onClearPlan: () => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';

const getPriceBadgeStyle = (level: string) => {
  const normalized = level.toLowerCase().trim();
  if (normalized.includes('libre') || normalized.includes('gratis')) {
    return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20';
  }
  if (normalized.includes('económico') || normalized.includes('economico')) {
    return 'bg-teal-500/15 text-teal-700 border-teal-500/20';
  }
  if (normalized.includes('moderado')) {
    return 'bg-blue-500/15 text-blue-700 border-blue-500/20';
  }
  if (normalized.includes('prémium') || normalized.includes('premium')) {
    return 'bg-purple-500/15 text-purple-700 border-purple-500/20';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const PlanModal: React.FC<PlanModalProps> = ({
  plan,
  onClose,
  onMovePlace,
  onRemovePlace,
  onClearPlan,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Bloqueo de scroll sin reflow
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Soporte de tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const whatsappUrl = useMemo(() => {
    const stepsText = plan
      .map(
        (place, index) =>
          `${index + 1}. ${place.name} (${place.municipality})\n   🔗 Ver ruta: https://quillaspot-prototype.vercel.app/?place=${place.id}`
      )
      .join('\n');

    const message = [
      '¡Hola! 🌴 Armé este plan para el fin de semana en QuillaSpot:',
      '',
      stepsText,
      '',
      '¿Quién se suma al plan? Miren los detalles y cómo llegar en el link 🚀',
    ].join('\n');

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [plan]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const shouldDismiss = info.offset.y > 70 || info.velocity.y > 250;
    if (shouldDismiss) {
      onClose();
    }
  };

  if (plan.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop Scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Fluid Bottom Sheet / Modal */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-plan-title"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={iosSpringMomentum}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
        className="relative z-10 w-full max-w-md sm:max-w-lg bg-[#F2F2F7] rounded-t-[32px] sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t sm:border border-white/60 touch-pan-y will-change-transform transform-gpu"
      >
        {/* Cabecera fija del modal */}
        <div className="bg-white/85 backdrop-blur-xl border-b border-black/[0.06] px-5 pt-3 pb-4 shrink-0">
          {/* iOS Grab Handle en móvil */}
          <div className="flex sm:hidden justify-center items-center pb-2.5">
            <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">
                <Route className="w-3.5 h-3.5" />
                <span>Ruta ({plan.length} de 4)</span>
              </div>
              <h2
                id="modal-plan-title"
                className="text-lg sm:text-xl font-bold tracking-[-0.02em] text-slate-900 leading-tight"
              >
                Tu Plan en QuillaSpot
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClearPlan}
                className="h-9 px-3 rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-100 ease-out active:scale-95 cursor-pointer"
                title="Limpiar todo el plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-transform duration-100 ease-out active:scale-95 cursor-pointer"
                aria-label="Cerrar itinerario"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista scrolleable de pasos numerados */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {plan.map((place, index) => {
            const imgSrc = failedImages[place.id]
              ? FALLBACK_IMAGE
              : place.imageUrl;
            const isFirst = index === 0;
            const isLast = index === plan.length - 1;

            return (
              <motion.div
                key={place.id}
                layout
                transition={iosSpringDefault}
                className="bg-white rounded-2xl p-3 border border-black/[0.04] shadow-2xs flex items-center gap-3"
              >
                {/* Foto miniatura con badge de Paso */}
                <div className="relative shrink-0">
                  <img
                    src={imgSrc}
                    alt={place.name}
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [place.id]: true }))
                    }
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100"
                  />
                  <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-xs tabular-nums">
                    {index + 1}
                  </span>
                </div>

                {/* Detalles del lugar */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                    {place.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{place.municipality}</span>
                  </p>
                  <div className="mt-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriceBadgeStyle(
                        place.priceLevel
                      )}`}
                    >
                      <span>$</span>
                      <span>{place.priceLevel}</span>
                    </span>
                  </div>
                </div>

                {/* Controles de reordenamiento y eliminación */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => onMovePlace(index, 'up')}
                      aria-label={`Subir ${place.name} al paso ${index}`}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition-transform duration-100 ease-out active:scale-90 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => onMovePlace(index, 'down')}
                      aria-label={`Bajar ${place.name} al paso ${index + 2}`}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition-transform duration-100 ease-out active:scale-90 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemovePlace(place.id)}
                    aria-label={`Quitar ${place.name} del plan`}
                    title="Quitar del plan"
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all duration-100 ease-out active:scale-90 cursor-pointer ml-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer con CTA principal a WhatsApp */}
        <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-xl border-t border-black/[0.06] shrink-0 space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold py-3.5 px-5 rounded-2xl shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-transform duration-100 ease-out active:scale-[0.98] cursor-pointer text-sm"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Compartir plan por WhatsApp</span>
          </a>
          <p className="text-[11px] text-center text-slate-400">
            Se enviará el plan ordenado con enlaces directos a cada lugar.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
