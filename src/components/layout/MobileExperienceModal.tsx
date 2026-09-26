import React, { useEffect, useRef, useState } from 'react';
import { Smartphone, X, QrCode, Check, Copy, Info } from 'lucide-react';
import QRCode from 'qrcode';

interface MobileExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
}

export const MobileExperienceModal: React.FC<MobileExperienceModalProps> = ({
  isOpen,
  onClose,
  targetUrl = 'https://quillaspot-prototype.vercel.app/',
}) => {
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Normalización estricta de URL (sin espacios)
  const cleanUrl = targetUrl.trim();

  useEffect(() => {
    // Generación con estándar estricto
    QRCode.toString(
      cleanUrl,
      {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      },
      (err, svgString) => {
        if (!err && svgString) {
          setQrSvg(svgString);
        }
      }
    );
  }, [cleanUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop con oscurecimiento completo */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="relative z-10 w-full max-w-sm my-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center max-h-[92vh] overflow-y-auto"
      >
        {/* Botón de Cierre Superior */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer z-10"
          aria-label="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge & Icono */}
        <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mb-2.5 shadow-xs shrink-0 mt-1">
          <Smartphone className="w-5 h-5" />
        </div>

        {/* Título Principal */}
        <h3 id="qr-modal-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
          ¡Mejor experiencia en tu celular!
        </h3>

        {/* Mensaje descriptivo */}
        <p className="text-xs text-slate-600 mt-1.5 max-w-[280px] leading-relaxed font-normal">
          QuillaSpot está pensada para llevar en el bolsillo: abre el GPS de Google Maps y chatea con los lugares con 1 toque.
        </p>

        {/* Contenedor del Código QR vectorizado */}
        <div className="mt-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-inner flex flex-col items-center w-full max-w-[240px]">
          <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 w-44 h-44 flex items-center justify-center overflow-hidden">
            {qrSvg ? (
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Generando QR...
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mt-2.5">
            <QrCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Escanea con la cámara o Google Lens</span>
          </div>
        </div>

        {/* Botón de copiar enlace */}
        <div className="w-full mt-3.5">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">¡Enlace copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copiar enlace al portapapeles</span>
              </>
            )}
          </button>
        </div>

        {/* Tip para Xiaomi / POCO / MIUI 
        <div className="w-full mt-3 p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-left flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900/90 leading-tight">
            <strong>¿Tienes Xiaomi / POCO?</strong> Si la app de cámara solo muestra "Copiar", usa el icono de <strong>Google Lens</strong> en la cámara o toca la app <strong>Escáner</strong> de tu teléfono para ir directo a Chrome.
          </p>
        </div>
        */}
      </div>
    </div>
  );
};
