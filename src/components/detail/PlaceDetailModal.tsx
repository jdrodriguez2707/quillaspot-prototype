import React, { useEffect, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Star, 
  Sparkles, 
  Navigation, 
  MessageCircle, 
  Instagram,
  Info, 
  Wallet, 
  Share2, 
  Check 
} from 'lucide-react';
import { Place } from '../../types/place';
import { iosSpringMomentum } from '../../utils/physics';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
}

// Estilos de badge por nivel de precio coherente con las tarjetas
const getPriceBadgeStyle = (level: string) => {
  const normalized = level.toLowerCase().trim();
  if (normalized.includes('libre') || normalized.includes('gratis')) {
    return 'bg-emerald-500/95 text-white border-emerald-400/40 shadow-emerald-900/10';
  }
  if (normalized.includes('económico') || normalized.includes('economico')) {
    return 'bg-teal-600/95 text-white border-teal-400/40 shadow-teal-900/10';
  }
  if (normalized.includes('moderado')) {
    return 'bg-blue-600/95 text-white border-blue-400/40 shadow-blue-900/10';
  }
  if (normalized.includes('prémium') || normalized.includes('premium')) {
    return 'bg-purple-600/95 text-white border-purple-400/40 shadow-purple-900/10';
  }
  return 'bg-slate-900/95 text-white border-slate-700/40';
};

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Bloqueo de scroll eficiente en móvil sin provocar reflow ni repintados del DOM
  useEffect(() => {
    if (place) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [place]);

  // Manejo de la tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!place) return null;

  // Detección dinámica de canal de contacto: Instagram (Direct Message) vs WhatsApp
  const isInstagram = place.whatsapp.includes('instagram.com');
  let contactUrl = '';

  if (isInstagram) {
    // Extraer el username o handle de Instagram (ej: caimandelrio)
    const match = place.whatsapp.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/i);
    const username = match && match[1] && !['direct', 'p', 'reel', 'stories'].includes(match[1]) ? match[1] : '';
    // Enlace universal a Instagram Direct Messages
    contactUrl = username 
      ? `https://ig.me/m/${username}` 
      : place.whatsapp;
  } else {
    const cleanPhone = place.whatsapp.replace(/\D/g, '');
    contactUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      place.whatsappMessage || `¡Hola! Los vi a través de QuillaSpot y me gustaría recibir más información sobre ${place.name}.`
    )}`;
  }

  const displayImage = imageError
    ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    : place.imageUrl;

  const handleShare = async () => {
    const shareData = {
      title: `${place.name} en QuillaSpot`,
      text: `¡Mira este plan en ${place.municipality}! ${place.shortDescription}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Cancelado o ignorado
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // No clipboard support
      }
    }
  };

  /**
   * WWDC Designing Fluid Interfaces: Momentum Projection & Velocity Handoff
   * - Umbral sensible para touch y desktop: 70px de arrastre o vy > 250px/s.
   */
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldDismiss = info.offset.y > 70 || info.velocity.y > 250;
    if (shouldDismiss) {
      onClose();
    }
  };

  const isFreeEntry = place.priceLevel.toLowerCase().includes('libre');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop Scrim: sin backdrop-blur pesado para 60-120fps puros en Android/iOS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Apple iOS Fluid Bottom Sheet en móviles / Dialog flotante en tablet y desktop con GPU acceleration */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-place-title"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={iosSpringMomentum}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
        className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-t-[32px] sm:rounded-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t sm:border border-white/50 touch-pan-y will-change-transform transform-gpu"
      >
        {/* Cabecera / Imagen con esquinas redondeadas continuas y grab handle integrado */}
        <div className="relative aspect-16/10 sm:aspect-16/9 w-full shrink-0 bg-slate-950 rounded-t-[32px] sm:rounded-t-3xl overflow-hidden select-none">
          <img
            src={displayImage}
            alt={place.name}
            draggable={false}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-t-[32px] sm:rounded-t-3xl pointer-events-none select-none"
          />

          {/* Gradiente superior e inferior para legibilidad y profundidad de materiales */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none rounded-t-[32px] sm:rounded-t-3xl" />

          {/* iOS Grab Handle - Visible en móvil para guiar la interacción física */}
          <div className="absolute top-2.5 inset-x-0 flex sm:hidden justify-center items-center pointer-events-none z-20">
            <div className="w-10 h-1.5 bg-white/70 backdrop-blur-md rounded-full shadow-xs" />
          </div>

          {/* Barra superior de acciones (Cerrar y Compartir) */}
          <div className="absolute top-4 sm:top-5 inset-x-3.5 sm:inset-x-5 flex items-center justify-between z-20">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-transform duration-100 ease-out cursor-pointer shadow-sm active:scale-95"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="h-9 px-3 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-xs font-semibold text-white transition-transform duration-100 ease-out cursor-pointer shadow-sm active:scale-95"
              title="Compartir este plan"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir</span>
                </>
              )}
            </button>
          </div>

          {/* Badges sobre la imagen en el bottom sheet */}
          <div className="absolute bottom-3 inset-x-4 flex items-end justify-between gap-2 text-white pointer-events-none">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {place.isFeatured && (
                  <span className="h-6 inline-flex items-center gap-1 px-2.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                    <Sparkles className="w-3 h-3 fill-white" />
                    <span>Recomendado</span>
                  </span>
                )}
                <span className="h-6 inline-flex items-center px-2.5 rounded-full text-[11px] font-semibold bg-black/50 backdrop-blur-md text-white">
                  {place.category}
                </span>
              </div>
            </div>

            <span className="h-6 inline-flex items-center gap-1 font-bold bg-amber-500 px-2.5 rounded-full text-xs shadow-xs">
              <Star className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
              <span className="tabular-nums">{place.rating.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Contenido scrolleable del detalle */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          {/* Título principal y ubicación con tracking negativo SF Pro */}
          <div>
            <h2 id="modal-place-title" className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              {place.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1.5 font-medium tracking-normal">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{place.address || `${place.municipality}, Atlántico`}</span>
            </p>
          </div>

          {/* Caja destacada: Presupuesto estimado / Rango de precios */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                {!isFreeEntry && (
                  <span className="font-bold text-slate-900">Rango de precios:</span>
                )}
                <span className={`inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${getPriceBadgeStyle(place.priceLevel)}`}>
                  <span className="w-3 h-3 rounded-full bg-white/25 flex items-center justify-center text-[8px] font-black text-white shrink-0 leading-none">
                    $
                  </span>
                  <span>{place.priceLevel}</span>
                </span>
              </div>
              <p className="text-slate-600 mt-1.5 font-medium leading-relaxed">
                {place.priceDetail || 'Consulta consumos o actividades directamente en el lugar.'}
              </p>
            </div>
          </div>

          {/* Descripción Completa */}
          <div className="space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Sobre este plan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {place.fullDescription || place.shortDescription}
            </p>
          </div>

          {/* Etiquetas / Tags temáticos */}
          {place.tags && place.tags.length > 0 && (
            <div className="pt-1">
              <div className="flex flex-wrap gap-1.5">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] sm:text-xs font-medium text-amber-900 bg-amber-100/60 border border-amber-200/50 px-2.5 py-1 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción Vitales (CTAs directos con respuesta instantánea pointer-down) */}
        <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md border-t border-black/[0.06] shrink-0 grid grid-cols-2 gap-3">
          {/* Botón Secundario: Cómo llegar (Google Maps) */}
          <a
            href={place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs sm:text-sm font-semibold transition-transform duration-100 ease-out active:scale-95 text-center shadow-2xs cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-slate-700" />
            <span>Cómo llegar</span>
          </a>

          {/* Botón Primario: Contactar (Verde con respuesta instantánea) */}
          <a
            href={contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-semibold transition-transform duration-100 ease-out shadow-sm shadow-[#25D366]/20 active:scale-95 text-center cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Contactar</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
