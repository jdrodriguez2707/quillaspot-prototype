import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import rawPlaces from './data/places.json';
import { Place, PlaceCategory } from './types/place';
import { Header } from './components/layout/Header';
import { HeroBanner } from './components/layout/HeroBanner';
import { CategoryFilter } from './components/filters/CategoryFilter';
import { SearchBar } from './components/filters/SearchBar';
import { PlaceList } from './components/places/PlaceList';
import { PlaceDetailModal } from './components/detail/PlaceDetailModal';
import { MobileExperienceModal } from './components/layout/MobileExperienceModal';
import { Footer } from './components/layout/Footer';
import { normalizeText } from './utils/text';

const CATEGORIES: PlaceCategory[] = [
  'Todos',
  'Gastronomía',
  'Ecoturismo',
  'Cultura y Ocio',
];

export default function App() {
  const [places] = useState<Place[]>(rawPlaces as Place[]);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Estado para el Fluid Bottom Sheet
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  // Estado para el modal de experiencia móvil en desktop
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Conteo dinámico de planes por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: places.length,
    };
    places.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [places]);

  // Filtrado resiliente con normalización de acentos y campos completos
  const filteredAndSortedPlaces = useMemo(() => {
    let result = [...places];

    // 1. Filtrar por categoría seleccionada en los botones
    if (selectedCategory !== 'Todos') {
      result = result.filter(
        (p) => normalizeText(p.category) === normalizeText(selectedCategory)
      );
    }

    // 2. Filtrar por término de búsqueda (insensible a acentos/tildes y mayúsculas)
    const normalizedQuery = normalizeText(searchTerm);
    if (normalizedQuery !== '') {
      result = result.filter((p) => {
        const matchName = normalizeText(p.name).includes(normalizedQuery);
        const matchCategory = normalizeText(p.category).includes(normalizedQuery);
        const matchMunicipality = normalizeText(p.municipality).includes(normalizedQuery);
        const matchShortDesc = normalizeText(p.shortDescription).includes(normalizedQuery);
        const matchFullDesc = normalizeText(p.fullDescription).includes(normalizedQuery);
        const matchPriceLevel = normalizeText(p.priceLevel).includes(normalizedQuery);
        const matchTags = p.tags?.some((t) => normalizeText(t).includes(normalizedQuery));

        return (
          matchName ||
          matchCategory ||
          matchMunicipality ||
          matchShortDesc ||
          matchFullDesc ||
          matchPriceLevel ||
          matchTags
        );
      });
    }

    // 3. Regla estricta de negocio: isFeatured: true primero, luego mayor rating
    return result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.rating - a.rating;
    });
  }, [places, selectedCategory, searchTerm]);

  // Detección de deep-link ?place=ID en la URL al cargar la página o al navegar con el historial (popstate)
  useEffect(() => {
    const syncPlaceFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const placeId = params.get('place');
      if (placeId) {
        const found = places.find((p) => p.id === placeId);
        if (found) {
          setSelectedPlace(found);
          return;
        }
      }
      // Si no hay parámetro place en URL, nos aseguramos de no forzar un estado desincronizado
    };

    // Al montar la app
    syncPlaceFromUrl();

    // Cuando el usuario presiona botón "Atrás" o "Adelante" del navegador
    window.addEventListener('popstate', syncPlaceFromUrl);
    return () => window.removeEventListener('popstate', syncPlaceFromUrl);
  }, [places]);

  const handleResetFilters = () => {
    setSelectedCategory('Todos');
    setSearchTerm('');
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    // Actualizamos la URL sin recargar la página para que refleje el lugar abierto
    const url = new URL(window.location.href);
    url.searchParams.set('place', place.id);
    window.history.pushState({ placeId: place.id }, '', url.toString());
  };

  const handleCloseModal = () => {
    setSelectedPlace(null);
    // Limpiamos el parámetro de la URL al cerrar el modal
    const url = new URL(window.location.href);
    if (url.searchParams.has('place')) {
      url.searchParams.delete('place');
      window.history.pushState({}, '', url.toString());
    }
  };

  const hasActiveFilters = selectedCategory !== 'Todos' || searchTerm.trim() !== '';

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-200">
      {/* Header estilo iOS Navigation Bar translúcido */}
      <Header onOpenQrModal={() => setIsQrModalOpen(true)} />

      {/* Contenedor Responsivo: Mobile, Tablet y Desktop (máximo 1200px con padding óptico) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6 pb-12">
        <HeroBanner totalPlaces={places.length} />

        {/* Barra de controles: Búsqueda y Filtros de categoría */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/50 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-black/[0.04] shadow-2xs">
          {/* Barra de búsqueda interactiva */}
          <div className="w-full md:max-w-md">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
            />
          </div>

          {/* Filtros de Categoría adaptados a desktop/tablet */}
          <div className="w-full md:w-auto overflow-hidden">
            <CategoryFilter
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
            />
          </div>
        </div>

        {/* Catálogo ordenado y filtrado */}
        <PlaceList
          places={filteredAndSortedPlaces}
          onSelectPlace={handleSelectPlace}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </main>

      {/* Apple Fluid Bottom Sheet de Detalle con AnimatePresence para salida animada */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailModal
            place={selectedPlace}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />

      {/* Modal QR de experiencia móvil en desktop montado a nivel raíz */}
      <MobileExperienceModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        targetUrl="https://quillaspot-prototype.vercel.app/"
      />
    </div>
  );
}
