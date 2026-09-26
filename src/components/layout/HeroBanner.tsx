import React from 'react';
import { Compass, Sparkles, Navigation } from 'lucide-react';

interface HeroBannerProps {
  totalPlaces: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ totalPlaces }) => {
  return (
    <section className="px-0 pt-2 sm:pt-4 pb-1">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 text-white p-5 sm:p-7 md:p-8 shadow-sm">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 -top-10 w-36 h-36 rounded-full bg-yellow-300/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] sm:text-xs font-semibold text-amber-50 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>Descubre la magia del Caribe</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
            ¿Qué hay pa' hacer en <span className="underline decoration-yellow-300 decoration-3 underline-offset-3">Quilla</span> hoy?
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/90 mt-2 max-w-xl leading-relaxed">
            Encuentra planes gastronómicos, culturales y de naturaleza en Barranquilla y municipios del Atlántico.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[11px] sm:text-xs font-medium">
            <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white">
              <Compass className="w-3.5 h-3.5 text-yellow-300" />
              <span>{totalPlaces} lugares disponibles</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white font-semibold shadow-2xs">
              <Navigation className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
              <span>Clic y llega directo</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
