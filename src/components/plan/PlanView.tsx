import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  ChevronUp,
  ChevronDown,
  Trash2,
  MessageCircle,
  Route,
  Compass,
} from 'lucide-react';
import { Place, PlanMoveDirection } from '../../types/place';
import { iosSpringDefault } from '../../utils/physics';

interface PlanViewProps {
  plan: Place[];
  onMovePlace: (index: number, direction: PlanMoveDirection) => void;
  onRemovePlace: (placeId: string) => void;
  onClearPlan: () => void;
  onNavigateHome: () => void;
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

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  onMovePlace,
  onRemovePlace,
  onClearPlan,
  onNavigateHome,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

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

  if (plan.length === 0) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/20 shadow-xs">
          <Route className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Aún no tienes lugares en tu plan
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
          Explora el catálogo de QuillaSpot, toca el botón <span className="font-semibold text-slate-700">+ Al plan</span> en los lugares que quieras visitar y arma tu ruta ideal por el Atlántico.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all duration-100 ease-out cursor-pointer"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Explorar planes y lugares</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-5">
      {/* Encabezado estilo iOS Large Title */}
      <div className="flex items-end justify-between border-b border-black/[0.06] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Route className="w-3.5 h-3.5" />
            <span>Ruta · {plan.length} de 4 paradas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.03em] text-slate-900 leading-tight">
            Tu Plan en QuillaSpot
          </h1>
        </div>

        <button
          type="button"
          onClick={onClearPlan}
          className="h-10 px-3.5 rounded-full bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 border border-black/[0.06] shadow-2xs transition-all duration-100 ease-out active:scale-95 cursor-pointer"
          title="Limpiar todo el plan"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpiar plan</span>
        </button>
      </div>

      {/* Lista de pasos numerados */}
      <div className="flex flex-col gap-3">
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
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-black/[0.05] shadow-sm flex items-center gap-3.5"
            >
              {/* Foto miniatura con badge de Paso */}
              <div className="relative shrink-0">
                <img
                  src={imgSrc}
                  alt={place.name}
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [place.id]: true }))
                  }
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100"
                />
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs flex items-center justify-center tabular-nums">
                  {index + 1}
                </span>
              </div>

              {/* Detalles del lugar */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                  {place.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">{place.municipality}</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getPriceBadgeStyle(
                      place.priceLevel
                    )}`}
                  >
                    <span>$</span>
                    <span>{place.priceLevel}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                    {place.category}
                  </span>
                </div>
              </div>

              {/* Controles de reordenamiento y eliminación */}
              <div className="flex items-center gap-1.5 shrink-0">
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
                  <span className="text-xs font-bold">×</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sección inferior para compartir por WhatsApp */}
      <div className="mt-4 bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.05] shadow-sm flex flex-col gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2.5 transition-transform duration-100 ease-out active:scale-[0.98] cursor-pointer text-sm sm:text-base"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span>Compartir plan por WhatsApp</span>
        </a>
        <p className="text-xs text-center text-slate-400">
          Se compartirá tu plan ordenado con enlaces directos a cada lugar en QuillaSpot.
        </p>
      </div>
    </div>
  );
};
