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

## 📁 Estructura de Carpetas Propuesta

```text
/
├── index.html              # Punto de entrada HTML con metaetiquetas SEO y viewport móvil
├── metadata.json           # Metadata del entorno
├── package.json            # Scripts y dependencias (React 19, Vite, Tailwind CSS v4, Lucide)
├── README.md               # Documentación y guía del proyecto
├── src/
│   ├── components/         # Componentes modulares y reutilizables
│   │   ├── layout/         # Barra superior (Header), barra de navegación o pie
│   │   ├── places/         # Tarjetas de lugar (PlaceCard), lista/grid de catálogo
│   │   ├── filters/        # Barra de categorías y filtros rápidos
│   │   └── detail/         # Modal / Drawer de vista en detalle y CTAs
│   ├── data/
│   │   └── places.json     # Única fuente de verdad (dataset de lugares en Barranquilla/Atlántico)
│   ├── types/
│   │   └── place.ts        # Definición de tipos TypeScript para el modelo de Lugar
│   ├── App.tsx             # Componente raíz orquestador de vistas y estado ligero
│   ├── index.css           # Configuración de Tailwind CSS y estilos base
│   └── main.tsx            # Inicialización de React en el DOM
```

---

## 🛠️ Decisiones Técnicas y Arquitectura (KISS)

1. **Mobile-First por diseño**:
   - Todo el sistema de maquetación prioriza anchos de pantalla móviles (`max-w-md mx-auto` o contenedor centrado con sensación nativa tipo app móvil en escritorio y 100% fluidez en pantallas táctiles).
2. **Cero Over-Engineering**:
   - Estado manejado mediante hooks nativos de React (`useState`, `useMemo`).
   - Sin librerías pesadas de estado ni dependencias innecesarias.
3. **Fuente de Datos Estática (`places.json`)**:
   - Cero latencia de arranque, sin configuración de base de datos en esta fase inicial.
   - Fácilmente migrable a una API o base de datos en fases posteriores.
4. **CTAs de Alta Conversión**:
   - Redirección nativa con deeplinks a **WhatsApp Web / App** (`https://wa.me/{numero}?text={mensaje}`) y **Google Maps** (`mapsUrl`).
5. **Rendimiento y Despliegue en Vercel**:
   - Bundling ultrarrápido con **Vite**, estilos utilitarios atómicos sin CSS superfluo con **Tailwind CSS**.

---

## 🗺️ Fases de Desarrollo Planificadas

- [ ] **Fase 1**: Configuración inicial, layout base (Header y contenedor Mobile-First) y carga tipada del archivo `places.json`.
- [ ] **Fase 2**: Componente de Tarjeta (`PlaceCard`) y Catálogo con lógica de ordenamiento (`isFeatured: true` de primero con badge destacado).
- [ ] **Fase 3**: Sistema de filtros interactivos por categoría (Gastronomía, Ecoturismo, Cultura y Ocio, etc.).
- [ ] **Fase 4**: Vista de detalle (modal/drawer fluido) y CTAs de redirección rápida a Maps y WhatsApp.
