import React, { useState } from 'react';
import rawPlaces from './data/places.json';
import { Place } from './types/place';
import { Header } from './components/layout/Header';
import { HeroBanner } from './components/layout/HeroBanner';
import { Footer } from './components/layout/Footer';

export default function App() {
  // Carga inicial y tipada de los lugares desde places.json
  const [places] = useState<Place[]>(rawPlaces as Place[]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans antialiased selection:bg-amber-200">
      {/* Barra superior Mobile-First */}
      <Header />

      {/* Contenedor principal con ancho móvil perfecto (max-w-md centrado) */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col pb-12">
        <HeroBanner totalPlaces={places.length} />

        {/* Sección temporal de Fase 1 para verificar la carga del JSON */}
        <section className="px-4 mt-3">
          <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Fase 1: Datos cargados ({places.length} lugares listos)
            </h2>
            <div className="divide-y divide-zinc-100">
              {places.map((place) => (
                <div key={place.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-800">{place.name}</span>
                    <span className="block text-[11px] text-zinc-500">
                      {place.category} • {place.municipality}
                    </span>
                  </div>
                  {place.isFeatured && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      ★ Destacado
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
