# QuillaSpot — Arquitectura y Reglas Técnicas

- **Stack:** React 19 + TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion v13, Lucide React.
- **Fuente de Datos:** `src/data/places.json` (Dataset estático local). Modificarlo respetando el tipo `Place`.
- **Físicas y Gestos (Apple HIG):** Usar siempre los tokens de `src/utils/physics.ts` (`iosSpringDefault`, `iosSpringMomentum`, `iosSpringSnappy`).
- **Direct Manipulation:** Respetar la inercia vertical del Bottom Sheet (`velocity.y > 250` o `offset.y > 70` para descartar).
- **Rendimiento Móvil:** Cero reflow (`overflow: hidden` + `scrollbar-gutter: stable`), aceleración GPU con `transform-gpu`.
- **Principio Rector:** KISS (Keep It Simple, Stupid). No agregar dependencias pesadas si React, Tailwind y TypeScript lo resuelven.