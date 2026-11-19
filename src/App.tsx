import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import rawPlaces from './data/places.json';
import {
  MoodFilterOption,
  Place,
  PlaceCategory,
  PlanMoveDirection,
  PlanToastState,
} from './types/place';
import { Header } from './components/layout/Header';
import { HeroBanner } from './components/layout/HeroBanner';
import { CategoryFilter } from './components/filters/CategoryFilter';
import { MoodFilter } from './components/filters/MoodFilter';
import { SearchBar } from './components/filters/SearchBar';
import { PlaceList } from './components/places/PlaceList';
import { FeaturedCarousel } from './components/places/FeaturedCarousel';
import { PlaceDetailModal } from './components/detail/PlaceDetailModal';
import { PlanBar } from './components/plan/PlanBar';
import { PlanModal } from './components/plan/PlanModal';
import { QuillaBotModal } from './components/bot/QuillaBotModal';
import { MobileExperienceModal } from './components/layout/MobileExperienceModal';
import { Footer } from './components/layout/Footer';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { normalizeText } from './utils/text';
import { getPlaceSearchScore, tokenizeSearchQuery } from './utils/search';
import { iosSpringSnappy } from './utils/physics';

const CATEGORIES: PlaceCategory[] = [
  'Gastronomía',
  'Ecoturismo',
  'Cultura y Ocio',
];

const MOODS: MoodFilterOption[] = [
  'En Pareja',
  'Con Amigos',
  'En Familia',
  'Plan Barato',
  'Al Aire Libre',
];

const MAX_PLAN_PLACES = 4;
const PLAN_STORAGE_KEY = 'quillaspot_plan_ids';

const loadInitialPlan = (catalog: Place[]): Place[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const uniqueIds = Array.from(
      new Set(parsed.filter((item): item is string => typeof item === 'string'))
    );

    return uniqueIds
      .map((id) => catalog.find((place) => place.id === id))
      .filter((place): place is Place => Boolean(place))
      .slice(0, MAX_PLAN_PLACES);
  } catch {
    return [];
  }
};

export default function App() {
  const [places] = useState<Place[]>(rawPlaces as Place[]);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('Todos');
  const [selectedMood, setSelectedMood] = useState<MoodFilterOption>('Todos los planes');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Estado para el Fluid Bottom Sheet
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  // Estado para el modal de experiencia móvil en desktop
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Estado Fase 2: Armar Plan (hasta 4 lugares, persistido en localStorage)
  const [plan, setPlan] = useState<Place[]>(() => loadInitialPlan(rawPlaces as Place[]));
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [planToast, setPlanToast] = useState<PlanToastState | null>(null);
  // Estado Fase 3: QuillaBot (Asistente IA)
  const [isQuillaBotOpen, setIsQuillaBotOpen] = useState<boolean>(false);

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

  // Top destacados para el carrusel horizontal (máximo 10, ordenados por calificación)
  const featuredPlaces = useMemo(() => {
    return places
      .filter((place) => place.isFeatured)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
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

    // 2. Filtrar por Mood (ocasión y ambiente)
    if (selectedMood !== 'Todos los planes') {
      result = result.filter((p) => p.moods.includes(selectedMood));
    }

    // 3. Búsqueda robusta multi-palabra (#tags, moods, barrio/dirección, sinónimos y relevancia)
    const searchTokens = tokenizeSearchQuery(searchTerm);
    if (searchTokens.length > 0) {
      const scored = result
        .map((place) => ({
          place,
          score: getPlaceSearchScore(place, searchTerm),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (a.place.isFeatured && !b.place.isFeatured) return -1;
          if (!a.place.isFeatured && b.place.isFeatured) return 1;
          return b.place.rating - a.place.rating;
        });

      return scored.map((entry) => entry.place);
    }

    // 4. Regla estricta de negocio sin búsqueda activa: isFeatured: true primero, luego mayor rating
    return result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.rating - a.rating;
    });
  }, [places, selectedCategory, selectedMood, searchTerm]);

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
    setSelectedMood('Todos los planes');
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

  // Sincronización del itinerario con localStorage
  useEffect(() => {
    try {
      const ids = plan.map((place) => place.id);
      window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Ignorar errores de almacenamiento (modo privado / cuota excedida)
    }
  }, [plan]);

  // Cierre automático del modal del itinerario si se queda vacío
  useEffect(() => {
    if (plan.length === 0 && isPlanModalOpen) {
      setIsPlanModalOpen(false);
    }
  }, [plan.length, isPlanModalOpen]);

  // Ocultar automáticamente el toast flotante de límite
  useEffect(() => {
    if (!planToast) return;
    const timer = window.setTimeout(() => {
      setPlanToast(null);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [planToast]);

  const isPlaceInPlan = useCallback(
    (placeId: string): boolean => plan.some((item) => item.id === placeId),
    [plan]
  );

  const togglePlaceInPlan = useCallback(
    (place: Place) => {
      const exists = plan.some((item) => item.id === place.id);
      if (exists) {
        setPlan((prev) => prev.filter((item) => item.id !== place.id));
        return;
      }

      if (plan.length >= MAX_PLAN_PLACES) {
        setPlanToast({
          id: Date.now(),
          message: `Máximo ${MAX_PLAN_PLACES} lugares por plan`,
        });
        return;
      }

      setPlan((prev) => [...prev, place]);
    },
    [plan]
  );

  const removePlaceFromPlan = useCallback((placeId: string) => {
    setPlan((prev) => prev.filter((item) => item.id !== placeId));
  }, []);

  const movePlaceInPlan = useCallback(
    (index: number, direction: PlanMoveDirection) => {
      setPlan((prev) => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (
          index < 0 ||
          index >= prev.length ||
          targetIndex < 0 ||
          targetIndex >= prev.length
        ) {
          return prev;
        }
        const next = [...prev];
        const [movedItem] = next.splice(index, 1);
        next.splice(targetIndex, 0, movedItem);
        return next;
      });
    },
    []
  );

  const clearPlan = useCallback(() => {
    setPlan([]);
    setIsPlanModalOpen(false);
  }, []);

  const handleOpenPlanFromDetail = useCallback(() => {
    setSelectedPlace(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('place')) {
      url.searchParams.delete('place');
      window.history.pushState({}, '', url.toString());
    }
    setIsPlanModalOpen(true);
  }, []);

  const handleSelectPlaceFromBot = useCallback((place: Place) => {
    setIsQuillaBotOpen(false);
    setSelectedPlace(place);
    const url = new URL(window.location.href);
    url.searchParams.set('place', place.id);
    window.history.pushState({ placeId: place.id }, '', url.toString());
  }, []);

  const handleSelectTagFromDetail = useCallback((tag: string) => {
    setSelectedPlace(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('place')) {
      url.searchParams.delete('place');
      window.history.pushState({}, '', url.toString());
    }
    setSelectedCategory('Todos');
    setSelectedMood('Todos los planes');
    setSearchTerm(`#${tag}`);
  }, []);

  const handleResetCategoryAndMood = useCallback(() => {
    setSelectedCategory('Todos');
    setSelectedMood('Todos los planes');
  }, []);

  const hasCategoryOrMoodFilter =
    selectedCategory !== 'Todos' || selectedMood !== 'Todos los planes';

  const hasActiveFilters =
    hasCategoryOrMoodFilter ||
    searchTerm.trim() !== '';

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-200">
      {/* Header fijo estilo iOS Navigation Bar translúcido, siempre visible */}
      <Header onOpenQrModal={() => setIsQrModalOpen(true)} />
      <div className="h-16 sm:h-[68px] shrink-0" aria-hidden="true" />

      {/* Toast flotante estilo iOS cuando se alcanza el límite de 4 lugares */}
      <AnimatePresence>
        {planToast && (
          <div className="fixed top-[74px] sm:top-[78px] inset-x-0 z-[70] flex justify-center px-4 pointer-events-none">
            <motion.div
              key={planToast.id}
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.94 }}
              transition={iosSpringSnappy}
              className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-xl text-white text-xs sm:text-sm font-semibold shadow-xl border border-white/10"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{planToast.message}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contenedor Responsivo: Mobile, Tablet y Desktop (máximo 1200px con padding óptico) */}
      <main
        className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6 transition-[padding] duration-200 ${
          plan.length > 0 ? 'pb-28' : 'pb-10'
        }`}
      >
        <HeroBanner totalPlaces={places.length} />

        {/* Carrusel horizontal fluido de lugares destacados */}
        <FeaturedCarousel
          places={featuredPlaces}
          isPlaceInPlan={isPlaceInPlan}
          onTogglePlan={togglePlaceInPlan}
          onSelectPlace={handleSelectPlace}
        />

        {/* Barra de controles: Búsqueda, Categorías y Filtro por Mood */}
        <div className="flex flex-col gap-2.5 bg-white/50 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-black/[0.04] shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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

          {/* Fila inferior: Filtro por Mood (Ocasión y Ambiente) */}
          <div className="border-t border-black/[0.05] pt-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {/*
            <span className="text-[11px] font-semibold text-slate-400 px-1 shrink-0 whitespace-nowrap">
              ¿Cuál es el plan?
            </span>
            */}
            <div className="w-full overflow-hidden">
              <MoodFilter
                moods={MOODS}
                selectedMood={selectedMood}
                onSelectMood={setSelectedMood}
              />
            </div>
          </div>

          {/* Activador Fase 3: QuillaBot + Opción para restablecer categoría y mood */}
          <div className="border-t border-black/[0.05] pt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsQuillaBotOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 py-2 text-xs sm:text-sm font-medium shadow-md inline-flex items-center justify-center gap-2 active:scale-95 transition-transform duration-100 ease-out cursor-pointer self-center sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>¿No sabes qué hacer? Pregúntale a QuillaBot</span>
            </button>

            {hasCategoryOrMoodFilter && (
              <button
                type="button"
                onClick={handleResetCategoryAndMood}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-black/[0.05] active:scale-95 transition-all duration-100 ease-out cursor-pointer self-center sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Restablecer filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Catálogo ordenado y filtrado */}
        <PlaceList
          places={filteredAndSortedPlaces}
          selectedCategory={selectedCategory}
          selectedMood={selectedMood}
          isPlaceInPlan={isPlaceInPlan}
          onTogglePlan={togglePlaceInPlan}
          onSelectPlace={handleSelectPlace}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </main>

      {/* Barra Flotante Inferior de Resumen del Plan */}
      <AnimatePresence>
        {plan.length > 0 && (
          <PlanBar
            plan={plan}
            onOpenModal={() => setIsPlanModalOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Apple Fluid Bottom Sheet de Detalle con AnimatePresence para salida animada */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailModal
            place={selectedPlace}
            isInPlan={isPlaceInPlan(selectedPlace.id)}
            planCount={plan.length}
            onTogglePlan={togglePlaceInPlan}
            onOpenPlan={handleOpenPlanFromDetail}
            onSelectTag={handleSelectTagFromDetail}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>

      {/* Modal de Ruta y Compartir por WhatsApp */}
      <AnimatePresence>
        {isPlanModalOpen && plan.length > 0 && (
          <PlanModal
            plan={plan}
            onClose={() => setIsPlanModalOpen(false)}
            onMovePlace={movePlaceInPlan}
            onRemovePlace={removePlaceFromPlan}
            onClearPlan={clearPlan}
          />
        )}
      </AnimatePresence>

      {/* Modal QuillaBot (Asistente Inteligente con Groq) */}
      <AnimatePresence>
        {isQuillaBotOpen && (
          <QuillaBotModal
            catalog={places}
            isPlaceInPlan={isPlaceInPlan}
            onTogglePlan={togglePlaceInPlan}
            onSelectPlace={handleSelectPlaceFromBot}
            onClose={() => setIsQuillaBotOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />

      {/* Menú inferior estilo iOS (Visual por ahora) */}
      <BottomTabBar />

      {/* Modal QR de experiencia móvil en desktop montado a nivel raíz */}
      <MobileExperienceModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        targetUrl="https://quillaspot-prototype.vercel.app/"
      />
    </div>
  );
}
