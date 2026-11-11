# QuillaSpot — Reporte Integral de Avance del Prototipo

> **Audiencia:** Agentes de Inteligencia Artificial, desarrolladores y stakeholders del proyecto.  
> **Estado del proyecto:** Prototipo funcional de alta fidelidad (MVP Avanzado).  
> **URL Producción:** `https://quillaspot-prototype.vercel.app/`

---

## 1. Resumen Ejecutivo y Visión de Producto

**QuillaSpot** es una Progressive Web App (PWA) de descubrimiento turístico, gastronómico y cultural para **Barranquilla y el departamento del Atlántico (Colombia)**. Su propuesta de valor es permitir al usuario encontrar y decidir un plan en menos de 2 segundos, eliminando toda fricción inicial.

### Principios Fundamentales de Producto
1. **Filosofía "Cero Login" (Zero-Login):**
   - El usuario final nunca tiene que registrarse, recordar contraseñas ni ingresar correos. El catálogo está abierto y disponible de inmediato al ingresar.
2. **Modelo de Negocio B2B:**
   - La plataforma es gratuita para los usuarios finales.
   - Los comercios y establecimientos locales pagan una suscripción de **$50.000 COP/mes** para aparecer como destacados (`isFeatured: true`), lo que garantiza su posición en la cabecera del catálogo.
3. **Conversión O2O (Online-to-Offline):**
   - El indicador clave de rendimiento (KPI) de la plataforma es la conversión de intención en acción física, canalizada a través de dos botones directos:
     - **"Cómo llegar"**: Apertura directa con geolocalización en Google Maps (`mapsUrl`).
     - **"Contactar"**: Apertura directa de WhatsApp con mensaje precargado personalizado para cada establecimiento (`whatsappMessage`) o enlace a Instagram Direct (`ig.me/m/username`).

---

## 2. Stack Tecnológico y Arquitectura

El proyecto sigue rigurosamente el principio **KISS (Keep It Simple, Stupid)**, evitando dependencias innecesarias, capas de abstracción complejas o bases de datos externas para la etapa del MVP.

| Capa | Tecnología | Justificación y Rol |
| :--- | :--- | :--- |
| **Framework Base** | React 19 + TypeScript | SPA rápida y reactiva con tipado estático riguroso. |
| **Bundler & Build Tool** | Vite 8 | Servidor de desarrollo instantáneo y empaquetado optimizado para producción. |
| **Estilos & Layout** | Tailwind CSS v4 (`@tailwindcss/vite`) | Utilidades atómicas modernas sin hojas de estilos CSS dispersas. |
| **Físicas y Animaciones** | Framer Motion (`framer-motion` v13) | Animaciones basadas en física de resortes (*springs*) en lugar de curvas estáticas. |
| **Iconografía** | Lucide React | Iconos SVG ligeros, coherentes y con estilo iOS minimalista. |
| **Generador QR** | `qrcode` (v1.5.4) | Renderizado vectorial SVG ISO/IEC 18004 100% nativo para el puente Desktop → Móvil sin APIs de terceros. |
| **Clima en Tiempo Real** | Open-Meteo API | Consulta pública y sin API key del clima actual en Barranquilla (`lat: 10.9685, lon: -74.7813`). |
| **Base de Datos MVP** | `src/data/places.json` | Dataset estático estructurado, rápido y fácil de mantener. |
| **Despliegue** | Vercel (`vercel.json`) | Configuración de rewrites a `index.html` para soportar navegación y deep linking. |

---

## 3. Implementación del Sistema de Diseño (Apple Human Interface Guidelines)

El diseño visual y la ergonomía de QuillaSpot implementan de forma rigurosa las directrices de **Apple Human Interface Guidelines (HIG)** y los principios de la conferencia de Apple **WWDC "Designing Fluid Interfaces"**.

### 3.1 Principios de Interfaz Fluida
- **Direct Manipulation (Manipulación Directa 1:1):**
  - El modal de detalle (**Fluid Bottom Sheet**) responde directamente al tacto o arrastre del usuario mediante `drag="y"`, `dragDirectionLock` y resistencia elástica (*rubber banding*).
- **Momentum Projection & Velocity Handoff:**
  - En lugar de cerrar el modal con tiempos fijos, el sistema evalúa la inercia del gesto del usuario:
    - **Flick Gesture (Lanzamiento rápido):** Si la velocidad vertical hacia abajo supera $250\text{ px/s}$ (`info.velocity.y > 250`), el sheet se descarta de inmediato con proyección natural.
    - **Distance Threshold (Arrastre sostenido):** Si se arrastra más de $70\text{ px}$ (`info.offset.y > 70`), el modal se cierra.
    - **Retorno Elástico:** Si no se superan los umbrales, regresa instantáneamente a su tope superior sin vibraciones molestas.
- **Kill Latency (Respuesta instantánea en Pointer-Down):**
  - Los botones interactivos reaccionan al presionar (`active:scale-[0.97]` o `active:scale-95` con `transition-transform duration-100 ease-out`), eliminando la sensación de retraso táctil.

### 3.2 Tokens de Resortes Físicos (`src/utils/physics.ts`)
```typescript
// Resorte por defecto de iOS: Críticamente amortiguado, sin oscilación
export const iosSpringDefault: Transition = {
  type: 'spring',
  damping: 30,
  stiffness: 350,
  mass: 0.8,
};

// Resorte para Bottom Sheet: Ultra-ágil (~220ms), reactivo y acelerado por GPU
export const iosSpringMomentum: Transition = {
  type: 'spring',
  damping: 30,
  stiffness: 420,
  mass: 0.5,
};

// Resorte para selectores y pills de categoría
export const iosSpringSnappy: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 400,
  mass: 0.6,
};
```

### 3.3 Materiales, Colores y Superficies
- **Fondo de Sistema:** Gris clásico de iOS `#F2F2F7`.
- **Barra de Navegación Translúcida (Vibrancy Bar):** `bg-white/70 backdrop-blur-xl saturate-180 border-b border-black/[0.06]`.
- **Esquinas Continuas (Squircle Curves):** Uso de `rounded-2xl`, `rounded-3xl` y `rounded-t-[32px]`.
- **Tipografía Nativa de Apple:** Pila con `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"`. Tracking negativo (`tracking-[-0.02em]`) en títulos principales y cifras tabulares (`tabular-nums`) para calificaciones y temperatura.
- **Badges de Precio de Sistema:**
  - *Entrada libre / Gratis*: Verde esmeralda (`bg-emerald-500/95`).
  - *Económico*: Verde azulado (`bg-teal-600/95`).
  - *Moderado*: Azul zafiro (`bg-blue-600/95`).
  - *Prémium*: Púrpura real (`bg-purple-600/95`).

---

## 4. Funcionalidades Desarrolladas en Detalle

### 4.1 Priorización Estricta de Negocio y Catálogo
- Los lugares se ordenan primero por `isFeatured: true` (comercios suscritos) y secundariamente por `rating` descendente.
- El catálogo responde con una cuadrícula elástica adaptable:
  - Móvil: 1 columna.
  - Tablet: 2 columnas.
  - Desktop: 3 columnas.

### 4.2 Búsqueda Resiliente con Normalización de Texto (`src/utils/text.ts`)
- Filtro insensible a mayúsculas, minúsculas, tildes y caracteres diacríticos (`NFD` normalization).
- La búsqueda inspecciona en paralelo: nombre del lugar, categoría, municipio, descripción corta, descripción completa, nivel de precio y lista de etiquetas (#tags).

### 4.3 Filtro por Categorías con Conteo en Tiempo Real
- Categorías soportadas: `Todos`, `Gastronomía`, `Ecoturismo`, `Cultura y Ocio`.
- Cada botón en forma de cápsula (*pill*) muestra un contador dinámico con la cantidad exacta de planes disponibles.

### 4.4 Fluid Bottom Sheet de Detalle con Deep Linking
- **Apertura y Cierre:** Animación con física de resorte `iosSpringMomentum`.
- **Deep Linking URL (`?place=ID`):**
  - Al abrir un lugar, se actualiza la URL sin recargar la página: `window.history.pushState({ placeId }, '', '?place=' + place.id)`.
  - Al cerrar el modal, se remueve el parámetro.
  - Al navegar con los botones "Atrás" o "Adelante" del navegador, el evento `popstate` sincroniza automáticamente el modal abierto.
- **Acción de Compartir Directa (`handleShare`):**
  - Utiliza `navigator.share` en dispositivos compatibles (iOS / Android) o copia la URL al portapapeles con feedback visual en desktop.
  - El enlace compartido lleva directamente al usuario a la ficha del lugar específico.
- **Botones de Conversión O2O:**
  - *Cómo llegar*: Redirección a Google Maps.
  - *Contactar*: Detección automática si es número de WhatsApp o cuenta de Instagram. Si es WhatsApp, formatea el texto personalizado listo para enviar.

### 4.5 Puente Desktop a Móvil (Mobile Experience Modal con QR)
- En resoluciones de escritorio o tablet, el header incluye el botón **"Abrir en el celular"**.
- Abre un modal con un código QR generado en formato SVG nativo (estándar ISO/IEC 18004 con quiet zone de 4 módulos y corrección de errores nivel M).
- Compatible con escáneres nativos de Xiaomi/POCO, Samsung y Apple Cámara, abriendo directamente la URL de producción sin requerir apps intermediarias.

### 4.6 Optimización de Rendimiento en Móviles
- **Cero Reflow en Apertura de Modal:** Se eliminó la técnica antigua de `position: fixed` sobre el `body` (que provocaba saltos de scroll y recálculos forzados de layout). Ahora se utiliza `document.body.style.overflow = 'hidden'` junto con la clase `modal-open` y `scrollbar-gutter: stable`.
- **Scrip Backdrop Optimizado:** El fondo oscuro utiliza `bg-black/60` sin filtros pesados de desenfoque simultáneos, asegurando 60 a 120 FPS en dispositivos móviles de gama baja y media.
- **Aceleración GPU:** Inclusión de `will-change-transform transform-gpu` en el contenedor del sheet.

---

## 5. Dataset de Lugares (`src/data/places.json`)

El archivo contiene 11 lugares curados que representan la oferta gastronómica, cultural y ecoturística de Barranquilla, Puerto Colombia y Usiacurí.

### 5.1 Estructura del Esquema (`Place` Type)
```typescript
export interface Place {
  id: string;               // Slug identificador único para URLs y deep links
  name: string;             // Nombre comercial del lugar
  category: PlaceCategory;  // 'Gastronomía' | 'Ecoturismo' | 'Cultura y Ocio'
  municipality: string;      // 'Barranquilla' | 'Puerto Colombia' | 'Usiacurí' | etc.
  priceLevel: PriceLevel;   // 'Entrada libre' | 'Económico' | 'Moderado' | 'Prémium'
  priceDetail: string;      // Ej: "COP 20.000 – 40.000 por persona"
  rating: number;           // Calificación de 1.0 a 5.0
  shortDescription: string; // Resumen directo para la tarjeta del catálogo
  fullDescription: string;  // Descripción detallada para el Bottom Sheet
  imageUrl: string;         // URL externa o ruta en /public/assets/places/
  tags: string[];           // Etiquetas temáticas (#Hamburguesas, #Atardecer, etc.)
  address: string;          // Dirección física legible
  mapsUrl: string;          // Enlace directo a Google Maps
  whatsapp: string;         // Teléfono con indicativo (+57...) o URL de Instagram
  whatsappMessage?: string; // Mensaje precargado personalizado para WhatsApp
  isFeatured: boolean;      // true para comercios destacados del modelo B2B
}
```

### 5.2 Catálogo Actual de Lugares
1. **Caimán del Río (Gran Malecón)** (`caiman-del-rio`)
   - *Categoría:* Gastronomía | *Municipio:* Barranquilla | *Nivel:* Moderado ($30.000 – 60.000)
   - *Destacado (B2B):* Sí | *Rating:* 4.8
2. **Castillo de Salgar** (`castillo-de-salgar`)
   - *Categoría:* Cultura y Ocio | *Municipio:* Puerto Colombia | *Nivel:* Moderado ($35.000 – 70.000)
   - *Destacado (B2B):* Sí | *Rating:* 4.6
3. **Restaurante Bar La Cueva** (`restaurante-la-cueva`)
   - *Categoría:* Gastronomía | *Municipio:* Barranquilla | *Nivel:* Prémium ($70.000 – 120.000)
   - *Destacado (B2B):* No | *Rating:* 4.7
4. **Ecoparque Ciénaga de Mallorquín** (`ecoparque-cienaga-mallorquin`)
   - *Categoría:* Ecoturismo | *Municipio:* Barranquilla | *Nivel:* Entrada libre (Consumo $15.000)
   - *Destacado (B2B):* Sí | *Rating:* 4.9
5. **Ruta Artesanal y Techos Pintados** (`usiacuri-artesanal`)
   - *Categoría:* Ecoturismo | *Municipio:* Usiacurí | *Nivel:* Económico ($15.000 – 40.000)
   - *Destacado (B2B):* No | *Rating:* 4.8
6. **Plaza y Muelle de Puerto Colombia** (`muelle-puerto-colombia`)
   - *Categoría:* Cultura y Ocio | *Municipio:* Puerto Colombia | *Nivel:* Económico ($25.000 – 50.000)
   - *Destacado (B2B):* No | *Rating:* 4.6
7. **The House Fast Food** (`the-house-fast-food`)
   - *Categoría:* Gastronomía | *Municipio:* Barranquilla (Los Trupillos) | *Nivel:* Económico ($20.000 – 40.000)
   - *Destacado (B2B):* Sí | *Rating:* 4.5
   - *Imagen local:* `/assets/places/the-house-fast-food.png`
8. **Ice Cream House** (`ice-cream-house`)
   - *Categoría:* Gastronomía | *Municipio:* Barranquilla (Los Trupillos) | *Nivel:* Económico ($8.000 – 25.000)
   - *Destacado (B2B):* Sí | *Rating:* 5.0
   - *Imagen local:* `/assets/places/ice-cream-house-restaurant.webp`
9. **Los Chamos Foods** (`los-chamos-food`)
   - *Categoría:* Gastronomía | *Municipio:* Barranquilla (La Unión) | *Nivel:* Económico ($20.000 – 40.000)
   - *Destacado (B2B):* Sí | *Rating:* 4.8
   - *Imagen local:* `/assets/places/los-chamos-food.webp`
10. **Las Rocas Restaurante** (`las-rocas`)
    - *Categoría:* Gastronomía | *Municipio:* Barranquilla (La Unión) | *Nivel:* Moderado ($40.000 – 60.000)
    - *Destacado (B2B):* Sí | *Rating:* 4.4 (Premio Mejor Sabor Típico de la Costa 2025/2026)
    - *Imagen local:* `/assets/places/restaurante-las-rocas.webp`
11. **Crunchy Ricuras** (`crunchy-ricuras`)
    - *Categoría:* Gastronomía | *Municipio:* Barranquilla (Miramar Plaza) | *Nivel:* Económico ($19.900 – 35.000)
    - *Destacado (B2B):* Sí | *Rating:* 5.0 (Pollo broaster, al horno, Crunchy Burger, Crunchy Bites)
    - *Imagen adaptada:* `/assets/places/crunchy-ricuras.jpg` (Tratamiento con fondo atmosférico desenfocado para preservar el menú vertical en relaciones de aspecto horizontales 16:10 y 16:9).

---

## 6. Estructura de Archivos del Proyecto

```text
├── .kiro/
│   ├── product.md               # Especificación de visión, Zero-Login y modelo B2B
│   └── tech.md                  # Reglas técnicas, stack y principio KISS
├── public/
│   └── assets/
│       └── places/              # Imágenes locales optimizadas de comercios aliados
├── src/
│   ├── components/
│   │   ├── detail/
│   │   │   └── PlaceDetailModal.tsx   # Fluid Bottom Sheet con física de inercia y deep linking
│   │   ├── filters/
│   │   │   ├── CategoryFilter.tsx     # Selector de categorías tipo cápsula con contadores
│   │   │   └── SearchBar.tsx          # Barra de búsqueda con normalización de acentos
│   │   ├── layout/
│   │   │   ├── Footer.tsx             # Pie de página institucional y copyright
│   │   │   ├── Header.tsx             # Vibrancy bar con clima en vivo y trigger de QR
│   │   │   ├── HeroBanner.tsx         # Banner motivacional de Barranquilla y Atlántico
│   │   │   └── MobileExperienceModal.tsx # Modal con código QR SVG nativo
│   │   └── places/
│   │       ├── PlaceCard.tsx          # Tarjeta de catálogo con esquinas continuas y badges
│   │       └── PlaceList.tsx          # Cuadrícula responsiva (1, 2 y 3 columnas)
│   ├── data/
│   │   └── places.json                # Base de datos en JSON con los 11 lugares
│   ├── types/
│   │   └── place.ts                   # Definición de tipos TypeScript para lugares y filtros
│   ├── utils/
│   │   ├── physics.ts                 # Constantes de resortes de Apple (damping, stiffness, mass)
│   │   └── text.ts                    # Normalización NFD para búsquedas insensibles a tildes
│   ├── App.tsx                        # Componente raíz, orquestación de estado y deep link URL
│   ├── index.css                      # Tailwind v4 import y reglas de scrollbar / accessibility
│   └── main.tsx                       # Entrypoint de React
├── DESIGN_SYSTEM.md                   # Documentación detallada de principios Apple HIG y físicas
├── PROTOTYPE_PROGRESS.md              # Este documento de avance y transferencia de contexto
├── package.json                       # Configuración de dependencias y scripts
├── tsconfig.json                      # Configuración estricta de TypeScript
└── vercel.json                        # Reglas de enrutamiento SPA para despliegue en Vercel
```

---

## 7. Próximas Funcionalidades (Roadmap MVP)

Basado en la visión estratégica establecida en `.kiro/product.md`, los próximos módulos a implementar son:

1. **Filtros por "Mood" (Ocasión y Presupuesto):**
   - Permitir al usuario filtrar rápidamente por: *En Pareja*, *Con Amigos*, *En Familia*, *Plan Barato / Descomplicado*, *Atardecer / Aire Libre*.
2. **"Armar Parche" (Generador de Itinerario Compartible):**
   - Selección rápida de 2 o 3 lugares (ej: Almuerzo en Caimán del Río + Atardecer en Puerto Colombia + Comida nocturna en The House).
   - Generación de un resumen formateado para compartir directamente por WhatsApp con el grupo de amigos.
3. **"QuillaBot" (Asistente Ligero con Gemini API):**
   - Micro-asistente conversacional rápido con contexto del catálogo local para responder dudas tipo: *"¿Dónde puedo comer rico y barato esta noche cerca de La Unión?"*.

---

## 8. Guía Rápida para Futuros Desarrolladores o Agentes de IA

1. **Para agregar o editar un comercio:**
   - Modifica únicamente `src/data/places.json`. Asegúrate de completar todos los campos del tipo `Place` (especialmente `whatsappMessage`, `mapsUrl`, `priceLevel`, `priceDetail`, y `tags`).
   - Si se añade una imagen local, guárdala en `/public/assets/places/` y referénciala como `/assets/places/nombre.ext`.
2. **Para verificar el proyecto:**
   - Compilación: `npm run build` o la herramienta `compile_applet`.
   - Lint y verificación de tipos: `npm run lint` o la herramienta `lint_applet`.
3. **Regla de Oro:**
   - Mantén la sencillez (**KISS**). No agregues librerías pesadas si Tailwind CSS, TypeScript y React nativo pueden resolver la necesidad con alta fidelidad y rendimiento.
