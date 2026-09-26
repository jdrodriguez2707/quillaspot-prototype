# QuillaSpot 📍🌊

**QuillaSpot** es un prototipo funcional (MVP) de aplicación web **Mobile-First** que centraliza planes turísticos, gastronómicos y de ocio en **Barranquilla y el departamento del Atlántico (Colombia)**.

Su propuesta de valor es **cero login** (fricción nula para el usuario) y una conversión directa del descubrimiento digital hacia visitas físicas reales mediante accesos directos a Google Maps y reservas/contacto inmediato por WhatsApp.

---

## 🚀 Cómo correr el proyecto localmente

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador (se recomienda activar la vista responsive / emulador móvil en las Developer Tools).

3. **Construir para producción (compatible con Vercel):**
   ```bash
   npm run build
   ```

---

## 📁 Estructura de Carpetas

```text
/
├── index.html              # Punto de entrada HTML con metaetiquetas SEO y viewport móvil
├── metadata.json           # Metadata del entorno
├── package.json            # Scripts y dependencias (React 19, Vite, Tailwind CSS v4, Lucide)
├── README.md               # Documentación y guía del proyecto
├── src/
│   ├── components/
│   │   ├── layout/         # Header (con clima nativo en Barranquilla), HeroBanner, Footer
│   │   ├── places/         # PlaceCard (ordenamiento de destacados, badges de precio), PlaceList
│   │   ├── filters/        # SearchBar (búsqueda insensible a tildes), CategoryFilter
│   │   └── detail/         # PlaceDetailModal (Sheet modal con CTAs a Maps y WhatsApp)
│   ├── data/
│   │   └── places.json     # Única fuente de verdad (dataset de planes del Atlántico)
│   ├── types/
│   │   └── place.ts        # Definición tipada TypeScript
│   ├── utils/
│   │   └── text.ts         # Normalización de textos y tildes para búsqueda en español
│   ├── App.tsx             # Orquestador del estado y vistas (KISS)
│   ├── index.css           # Configuración de Tailwind CSS
│   └── main.tsx            # Inicialización de React
```

---

## 🛠️ Decisiones Técnicas y Arquitectura (KISS)

1. **Mobile-First por diseño**:
   - Todo el sistema de maquetación prioriza anchos de pantalla móviles (`max-w-md mx-auto` con soporte táctil, gestos activos y scroll suave).
2. **Cero Over-Engineering**:
   - Estado manejado mediante hooks nativos de React (`useState`, `useMemo`).
   - Sin librerías pesadas de estado ni dependencias innecesarias.
3. **Fuente de Datos Estática (`places.json`)**:
   - Cero latencia de arranque, sin configuración de base de datos en esta fase inicial.
4. **CTAs Vitales de Alta Conversión**:
   - Redirección nativa con deeplinks a **WhatsApp** (`https://wa.me/{numero}?text={mensaje}`) y **Google Maps** (`mapsUrl`) en pestañas nuevas seguras (`target="_blank" rel="noopener noreferrer"`).
5. **Clima Nativo sin Permisos**:
   - Coordenadas geográficas fijas de Barranquilla vía API abierta de Open-Meteo, sin solicitar permisos invasivos de ubicación.
6. **Búsqueda Resiliente en Español**:
   - Normalización de tildes/acentos en nombres, categorías, municipios y descripciones.

---

## 🗺️ Fases de Desarrollo Planificadas

- [x] **Fase 1**: Configuración inicial, layout base (Header mobile-first y contenedor principal) y carga del JSON.
- [x] **Fase 2**: Componente de Tarjeta (`PlaceCard`) y Catálogo con lógica de ordenamiento (`isFeatured: true` de primero con badge destacado) y niveles de precios.
- [x] **Fase 3**: Sistema de filtros interactivos por categoría y búsqueda insensible a acentos.
- [x] **Fase 4**: Vista de detalle (modal/sheet fluido) y CTAs de redirección rápida a Maps y WhatsApp.
