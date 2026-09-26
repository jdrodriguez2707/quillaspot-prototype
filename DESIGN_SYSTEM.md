# QuillaSpot Design System: Apple Human Interface & Fluid Interfaces

Este documento consolida la arquitectura de diseño, principios físicos, tokens y directrices de accesibilidad implementadas en **QuillaSpot**, inspiradas rigurosamente en las directrices de diseño de Apple (**Human Interface Guidelines**) y los principios presentados en **WWDC "Designing Fluid Interfaces"**.

---

## 1. Principios Fundamentales de Diseño

### 1.1 Direct Manipulation (Manipulación Directa 1:1)
- Cada objeto en pantalla responde de forma física al tacto del usuario sin demoras de renderizado.
- En el modal de detalle (**Fluid Bottom Sheet**), el contenedor rastrea el movimiento vertical del puntero o dedo en proporción 1:1 (`drag="y"`, `dragDirectionLock`).
- La física de elasticidad superior (*rubber banding*) refleja la resistencia física de los materiales antes de un tope.

### 1.2 Momentum Projection & Velocity Handoff
- Las animaciones no tienen duraciones estáticas (`duration: 300ms`), sino que transfieren la **velocidad física** impartida por el usuario:
  - **Flick Gesture (Lanzamiento)**: Si la velocidad vertical hacia abajo supera los $250\text{ px/s}$, la interfaz asume la intención de descarte de inmediato, proyectando el movimiento de forma natural.
  - **Distance Threshold (Arrastre sostenido)**: Si el usuario arrastra más de $70\text{ px}$, el panel se descarta suavemente.
  - **Settle Spring (Retorno elástico)**: Si no se superan los umbrales de salida, el panel regresa a su posición original sin oscilaciones molestas.

### 1.3 Kill Latency (Respuesta Instantánea en Pointer-Down)
- Los elementos interactivos no esperan al evento `click` o `pointerup` para manifestar interactividad.
- Al instante del `pointerdown` / `:active`, se produce una micro-contracción táctil elástica (`active:scale-[0.97]` con `transition: transform 100ms ease-out`).

---

## 2. Parámetros Físicos de Resortes (Spring Physics)

Definidos en `src/utils/physics.ts`:

| Token | Propósito | Damping | Stiffness | Mass | Comportamiento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `iosSpringDefault` | Transiciones generales | 30 | 350 | 0.8 | Críticamente amortiguado, sin rebote oscilatorio. |
| `iosSpringMomentum`| Bottom Sheet & Paneles | 32 | 380 | 0.8 | Ágil, asimila velocidad de inercia y asienta firmemente. |
| `iosSpringSnappy`  | Píldoras y selectores  | 25 | 400 | 0.6 | Ultra-reactivo para navegación entre pestañas (`layoutId`). |

---

## 3. Paleta de Colores y Tokens de Sistema

### 3.1 Superficies y Fondos
- **System Grouped Background**: `#F2F2F7` (Gris de sistema de iOS).
- **Surface Elevation**: `#FFFFFF` con borde perimetral sutil (`border-black/[0.04]` o `border-black/[0.06]`) en lugar de sombras opacas pesadas.
- **Translucent Vibrancy Bar**: `bg-white/70 backdrop-blur-xl saturate-180 border-b border-black/[0.06] border-t border-white/40`.
- **Dimming Scrim Backdrop**: `bg-black/45 backdrop-blur-xs`.

### 3.2 Identidad de Acentos y Categorías
- **Barranquilla Sun Accent**: Gradiente solar de ámbar a naranja (`from-amber-500 via-orange-500 to-yellow-400`).
- **Nivel de Precio**:
  - *Entrada libre / Gratis*: `bg-emerald-500/95` (Verde esmeralda).
  - *Económico*: `bg-teal-600/95` (Verde azulado).
  - *Moderado*: `bg-blue-600/95` (Azul zafiro).
  - *Prémium*: `bg-purple-600/95` (Púrpura real).
- **Acción Primaria de Conversión (WhatsApp)**: `#25D366` con `active:scale-95`.

---

## 4. Tipografía y Jerarquía Óptica

- **Pila tipográfica nativa**:
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  ```
- **Ajustes de renderizado óptico**:
  - Antialiasing subpíxel activo: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`.
  - Tracking óptico negativo en títulos grandes: `tracking-[-0.02em]` para titulares compactos e impactantes.
  - Cifras y métricas numéricas tabulares: `tabular-nums` para evitar parpadeos en valores de temperatura y calificaciones.

---

## 5. Ergonomía Visual de Scroll

- **Recorrido (Track) 100% transparente**: Evita bandas grises rígidas en los costados de la pantalla.
- **Sin flechas ni botones**: Se suprimen por completo `::-webkit-scrollbar-button`.
- **Cápsula redondeada**: `width: 6px`, `border-radius: 9999px`, color sutil con desvanecimiento al reposo.
- **Estabilidad de maquetación (Zero Layout Shift)**: Mediante `scrollbar-gutter: stable;` y compensación en `body.modal-open`, la apertura y cierre de modales no altera la anchura ni desplaza las tarjetas del catálogo.

---

## 6. Accesibilidad (A11y) y Reducción de Movimiento

- **Respeto a `prefers-reduced-motion`**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- Los usuarios con sensibilidad al movimiento reciben transiciones directas y sutiles sin oscilaciones físicas ni traslaciones largas.
- Semántica accesible en modales (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) y soporte universal de tecla `Escape`.
