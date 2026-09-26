import React from 'react';
import { Compass, Sparkles, Navigation } from 'lucide-react';

interface HeroBannerProps {
  totalPlaces: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ totalPlaces }) => {
  return (
    <section className="px-4 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 text-white p-4 shadow-sm">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-12 -top-6 w-20 h-20 rounded-full bg-yellow-300/20 blur-lg pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-medium text-amber-50 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>Descubre la magia del Caribe</span>
          </div>

          <h1 className="text-xl font-black tracking-tight leading-snug">
            ¿Qué hay pa' hacer en <span className="underline decoration-yellow-300 decoration-2 underline-offset-2">Quilla</span> hoy?
          </h1>

          <p className="text-xs text-amber-100/90 mt-1 line-clamp-2">
            Encuentra planes gastronómicos, culturales y de naturaleza en Barranquilla y municipios del Atlántico.
          </p>

          <div className="mt-3 flex items-center gap-2.5 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white">
              <Compass className="w-3.5 h-3.5 text-yellow-300" />
              <span>{totalPlaces} lugares disponibles</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-semibold shadow-2xs">
              <Navigation className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
              <span>Clic y llega directo</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
