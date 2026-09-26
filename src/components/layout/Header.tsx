import React, { useEffect, useState } from 'react';
import { Sun, CloudSun, CloudRain, Smartphone, QrCode } from 'lucide-react';
import { MobileExperienceModal } from './MobileExperienceModal';

interface WeatherData {
  temperature: number;
  condition: string;
}

interface HeaderProps {
  onOpenQrModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQrModal }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isInternalQrOpen, setIsInternalQrOpen] = useState(false);

  const handleOpenQr = () => {
    if (onOpenQrModal) {
      onOpenQrModal();
    } else {
      setIsInternalQrOpen(true);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Coordenadas fijas de Barranquilla: lat 10.9685, lon -74.7813
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=10.9685&longitude=-74.7813&current=temperature_2m,weather_code'
    )
      .then((res) => {
        if (!res.ok) throw new Error('Error al consultar clima');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const temp = Math.round(data.current?.temperature_2m ?? 31);
        const code = data.current?.weather_code ?? 0;

        let condition = 'Soleado';
        if (code >= 1 && code <= 3) condition = 'Parc. Nublado';
        else if (code >= 51 && code <= 67) condition = 'Llovizna';
        else if (code >= 80) condition = 'Lluvia';

        setWeather({ temperature: temp, condition });
      })
      .catch(() => {
        if (isMounted) {
          setWeather({ temperature: 31, condition: 'Soleado' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const renderWeatherIcon = () => {
    if (!weather) return <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin" />;
    if (weather.condition.includes('Lluvia') || weather.condition.includes('Llovizna')) {
      return <CloudRain className="w-3.5 h-3.5 text-sky-500" />;
    }
    if (weather.condition.includes('Nublado')) {
      return <CloudSun className="w-3.5 h-3.5 text-amber-500" />;
    }
    return <Sun className="w-3.5 h-3.5 text-amber-500" />;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl saturate-180 border-b border-black/[0.06] border-t border-white/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo & iOS Style Large Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 active:scale-95 transition-transform duration-100 ease-out cursor-pointer">
            <Sun className="w-5 h-5 fill-yellow-100 text-yellow-50" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 leading-tight">
              <h1 className="text-xl font-bold tracking-[-0.02em] text-slate-900">
                Quilla<span className="text-amber-500">Spot</span>
              </h1>
            </div>
            <p className="text-[11px] font-medium tracking-normal text-slate-500 leading-none mt-0.5">
              Arma tu plan en el Atlántico
            </p>
          </div>
        </div>

        {/* Acciones del Header: Botón Abrir en Celular (Desktop/Tablet) + Clima */}
        <div className="flex items-center gap-2.5">
          {/* Botón QR Abrir en Celular: Visible en sm/md/lg/xl, oculto en pantallas móviles pequeñas */}
          <button
            onClick={handleOpenQr}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="Abrir QuillaSpot en tu celular escaneando código QR"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <span>Abrir en el celular</span>
            <QrCode className="w-3 h-3 text-amber-500 ml-0.5" />
          </button>

          {/* Weather Pill estilo iOS Capsule */}
          <div 
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white/80 backdrop-blur-md border border-black/[0.06] px-2.5 py-1 rounded-full shadow-2xs active:scale-95 transition-transform duration-100 ease-out"
            title={`Clima actual en Barranquilla: ${weather?.condition || 'Cargando...'} ${weather?.temperature ?? 31}°C`}
          >
            {renderWeatherIcon()}
            <span className="tabular-nums font-semibold">{weather ? `${weather.temperature}°C` : '31°C'}</span>
            <span className="text-[10px] font-medium text-slate-400">Baq</span>
          </div>
        </div>
      </div>

      {/* Modal con código QR para abrir en celular (cuando no se maneja globalmente) */}
      {!onOpenQrModal && (
        <MobileExperienceModal
          isOpen={isInternalQrOpen}
          onClose={() => setIsInternalQrOpen(false)}
          targetUrl="https://quillaspot-prototype.vercel.app/"
        />
      )}
    </header>
  );
};
