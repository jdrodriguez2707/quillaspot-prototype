import React, { useMemo } from 'react';
import rawPlaces from './data/places.json';
import { Place } from './types/place';
import { Header } from './components/layout/Header';
import { HeroBanner } from './components/layout/HeroBanner';
import { PlaceList } from './components/places/PlaceList';
import { Footer } from './components/layout/Footer';

export default function App() {
  // Lógica de ordenamiento Fase 2:
  // Los lugares con isFeatured: true DEBEN renderizarse primero en la lista
  const sortedPlaces = useMemo(() => {
    const list = [...(rawPlaces as Place[])];
    return list.sort((a, b) => {
      // 1. Prioridad a destacados (isFeatured: true primero)
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      // 2. Si ambos son destacados o ambos no, ordenar por rating descendente
      return b.rating - a.rating;
    });
  }, []);

  const handleSelectPlace = (place: Place) => {
    // Listo para engancharse con la Fase 4 (Modal de detalle)
    // De momento mostramos el log o feedback en consola/interacción suave
    console.log('Lugar seleccionado:', place.name);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans antialiased selection:bg-amber-200">
      {/* Barra superior con clima nativo en Barranquilla */}
      <Header />

      {/* Contenedor Mobile-First centrado */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col gap-3 pb-10">
        <HeroBanner totalPlaces={sortedPlaces.length} />

        {/* Catálogo con ordenamiento de destacados */}
        <PlaceList
          places={sortedPlaces}
          onSelectPlace={handleSelectPlace}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
