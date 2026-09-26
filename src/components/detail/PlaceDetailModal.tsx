import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  Sparkles, 
  Navigation, 
  MessageCircle, 
  Info, 
  Wallet, 
  Share2, 
  Check 
} from 'lucide-react';
import { Place } from '../../types/place';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
}

// Estilos de badge por nivel de precio coherente con las tarjetas
const getPriceBadgeStyle = (level: string) => {
  const normalized = level.toLowerCase().trim();
  if (normalized.includes('libre') || normalized.includes('gratis')) {
    return 'bg-emerald-500 text-white border-emerald-400';
  }
  if (normalized.includes('económico') || normalized.includes('economico')) {
    return 'bg-teal-600 text-white border-teal-400';
  }
  if (normalized.includes('moderado')) {
    return 'bg-blue-600 text-white border-blue-400';
  }
  if (normalized.includes('prémium') || normalized.includes('premium')) {
    return 'bg-purple-600 text-white border-purple-400';
  }
  return 'bg-zinc-800 text-white border-zinc-600';
};

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Bloqueo de scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (place) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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

  // Construcción del enlace nativo a WhatsApp con codificación adecuada de URI
  const whatsappUrl = `https://wa.me/${place.whatsapp}?text=${encodeURIComponent(
    place.whatsappMessage || `¡Hola! Los vi a través de QuillaSpot y me gustaría recibir más información sobre ${place.name}.`
  )}`;

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Contenedor del Modal / Sheet Mobile-First */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-place-title"
        className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250"
      >
        {/* Cabecera / Imagen y Botón de cierre */}
        <div className="relative aspect-16/10 w-full shrink-0 bg-zinc-900">
          <img
            src={displayImage}
            alt={place.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />

          {/* Gradiente para contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

          {/* Barra superior de acciones (Cerrar y Compartir) */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer shadow-xs active:scale-95"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="h-9 px-3 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs active:scale-95"
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

          {/* Badges sobre la imagen en el modal */}
          <div className="absolute bottom-3 inset-x-4 flex items-end justify-between gap-2 text-white">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {place.isFeatured && (
                  <span className="h-6 inline-flex items-center gap-1 px-2.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                    <Sparkles className="w-3 h-3 fill-white" />
                    <span>★ Recomendado</span>
                  </span>
                )}
                <span className="h-6 inline-flex items-center px-2.5 rounded-full text-[11px] font-semibold bg-black/50 backdrop-blur-xs text-white">
                  {place.category}
                </span>
              </div>
            </div>

            <span className="h-6 inline-flex items-center gap-1 font-bold bg-amber-500 px-2.5 rounded-full text-xs shadow-xs">
              <Star className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
              {place.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Contenido scrolleable del detalle */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-zinc-800">
          {/* Título principal y ubicación */}
          <div>
            <h2 id="modal-place-title" className="text-xl font-black text-zinc-900 leading-tight">
              {place.name}
            </h2>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{place.address || `${place.municipality}, Atlántico`}</span>
            </p>
          </div>

          {/* Caja destacada de Nivel de Precio y Detalle de Costos */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                {!place.priceLevel.toLowerCase().includes('libre') && (
                  <span className="font-bold text-zinc-900">Rango de precios:</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriceBadgeStyle(place.priceLevel)}`}>
                  {place.priceLevel}
                </span>
              </div>
              <p className="text-zinc-600 mt-1 font-medium leading-relaxed">
                {place.priceDetail || 'Consulta consumos o actividades directamente en el lugar.'}
              </p>
            </div>
          </div>

          {/* Descripción Completa */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Sobre este plan
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
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
                    className="text-[11px] font-medium text-amber-900 bg-amber-100/70 border border-amber-200/60 px-2.5 py-1 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción Vitales (CTAs de conversión directa) */}
        <div className="p-4 bg-white border-t border-zinc-200/80 shrink-0 grid grid-cols-2 gap-2.5">
          {/* Botón Cómo llegar -> mapsUrl */}
          <a
            href={place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98] text-center"
          >
            <Navigation className="w-4 h-4 text-amber-400" />
            <span>Cómo llegar</span>
          </a>

          {/* Botón Reservar / WhatsApp -> https://wa.me/... */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98] text-center"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Contactar</span>
          </a>
        </div>
      </div>
    </div>
  );
};
