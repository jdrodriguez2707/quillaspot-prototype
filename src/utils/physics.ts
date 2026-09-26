import { Transition } from 'framer-motion';

/**
 * Apple Design Fluid Springs
 * Principios extraídos de WWDC Designing Fluid Interfaces:
 * - Critically damped (damping: 1.0, bounce: 0): Para transiciones de interfaz estándar, limpias y sin distracción.
 * - Momentum / Flick (damping: ~0.8, bounce: 0.15): Para cuando una acción física previa trae impulso (arrastrar sheet, deslizar).
 */

// Resorte por defecto de iOS: suave, preciso, sin rebote oscilatorio
export const iosSpringDefault: Transition = {
  type: 'spring',
  damping: 30,
  stiffness: 350,
  mass: 0.8,
};

// Resorte para Bottom Sheet de iOS: Ultra rápido (240ms aprox), reactivo y acelerado por GPU
export const iosSpringMomentum: Transition = {
  type: 'spring',
  damping: 30,
  stiffness: 420,
  mass: 0.5,
};

// Resorte ultra-reactivo para microinteracciones de pills y selecciones
export const iosSpringSnappy: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 400,
  mass: 0.6,
};
