# QuillaSpot - Reglas Técnicas y Arquitectura

- **Stack Base:** React (Next.js o Vite), Tailwind CSS para estilos.
- **Base de Datos MVP:** Por ahora, los datos siguen viviendo en un archivo estructurado `places.json`. No instalar bases de datos complejas aún.
- **Diseño (Apple HIG):** La UI debe sentirse como una app nativa de iOS. Uso de `backdrop-blur` (vidrio esmerilado), bordes muy redondeados (`rounded-2xl`, `rounded-3xl`), fondo gris (`bg-[#F2F2F7]`).
- **Físicas y Gestos:** Usar `framer-motion` para animaciones con resortes (springs) en lugar de duraciones fijas. La vista de detalle debe ser un "Bottom Sheet" (modal deslizable desde abajo).
- **Regla de Oro (KISS):** Cero over-engineering. No usar Redux, no instalar librerías pesadas si Tailwind o React nativo lo pueden resolver.