import React, { useState, useMemo } from 'react';
import rawPlaces from './data/places.json';
import { Place, PlaceCategory } from './types/place';
import { Header } from './components/layout/Header';
import { HeroBanner } from './components/layout/HeroBanner';
import { CategoryFilter } from './components/filters/CategoryFilter';
import { SearchBar } from './components/filters/SearchBar';
import { PlaceList } from './components/places/PlaceList';
import { PlaceDetailModal } from './components/detail/PlaceDetailModal';
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
  
  // Estado para la vista en detalle (Fase 4)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

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

  const handleResetFilters = () => {
    setSelectedCategory('Todos');
    setSearchTerm('');
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleCloseModal = () => {
    setSelectedPlace(null);
  };

  const hasActiveFilters = selectedCategory !== 'Todos' || searchTerm.trim() !== '';

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-200">
      {/* Header estilo iOS Navigation Bar translúcido */}
      <Header />

      {/* Contenedor Mobile-First centrado */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col gap-3 pb-10">
        <HeroBanner totalPlaces={places.length} />

        {/* Barra de búsqueda interactiva */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
        />

        {/* Filtros de Categoría con scroll táctil horizontal */}
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* Catálogo ordenado y filtrado */}
        <PlaceList
          places={filteredAndSortedPlaces}
          onSelectPlace={handleSelectPlace}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </main>

      {/* Modal / Sheet de Vista en Detalle y Botones de Conversión (Fase 4) */}
      <PlaceDetailModal
        place={selectedPlace}
        onClose={handleCloseModal}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
