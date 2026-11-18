import React from 'react';
import { Compass, MapPin, Waves } from 'lucide-react';

interface HeroBannerProps {
  totalPlaces: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ totalPlaces }) => {
  return (
    <section className="px-0 pt-2 sm:pt-4 pb-1">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 text-white p-5 sm:p-7 md:p-8 shadow-sm">
        {/* Elementos decorativos sutiles de fondo (Sol y Brisa Caribeña) */}
        <div className="absolute -right-8 -bottom-8 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-20 -top-12 w-44 h-44 rounded-full bg-yellow-300/25 blur-xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-36 h-20 bg-orange-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          {/* Badge de territorio Caribe y Atlántico */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold text-amber-50 mb-3 shadow-2xs">
            <Waves className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span>Tu radar en el Caribe · Barranquilla y todo el Atlántico</span>
          </div>

          {/* Titular llamativo e inclusivo para Quilla y el Atlántico */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-[1.15] text-white">
            ¿Qué hay pa' hacer en <span className="text-yellow-300">Quilla</span> y el{' '}
            <span className="underline decoration-yellow-300/80 decoration-3 underline-offset-4">
              Atlántico
            </span>
            ?
          </h1>

          {/* Descripción general, impactante y costeña pensada para escalar a 50+ lugares */}
          <p className="text-xs sm:text-sm text-amber-50/95 mt-2.5 max-w-xl leading-relaxed font-normal">
            Tu guía definitiva para salir el finde: descubre dónde comer sabroso, ver caer la tarde frente al mar, armar planes al aire libre y gozarte lo mejor de Barranquilla y cada rincón del Atlántico.
          </p>

          {/* Píldoras informativas del territorio */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full text-white border border-white/10 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span>Ciudad, río, mar y pueblos</span>
            </span>
            {/* 
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-semibold border border-white/25 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-yellow-200 shrink-0" />
              <span>{totalPlaces} spots curados</span>
            </span>
            */}
          </div>
        </div>
      </div>
    </section>
  );
};
