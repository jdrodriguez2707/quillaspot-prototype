import React, { useEffect, useState } from 'react';
import { Sun, CloudSun, CloudRain, MapPin } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
}

export const Header: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Coordenadas fijas de Barranquilla: lat 10.9685, lon -74.7813
    // Open-Meteo: Gratuita, sin API key, no pide permisos de ubicación al usuario
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
          // Fallback predeterminado típico de Barranquilla en caso de fallo de red
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-sm shadow-orange-300">
            <Sun className="w-5 h-5 fill-yellow-200 text-yellow-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-lg tracking-tight text-zinc-900">
                Quilla<span className="text-amber-500">Spot</span>
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Atlántico
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-600 inline" />
              Barranquilla & Alrededores
            </p>
          </div>
        </div>

        {/* Indicador del Clima en Barranquilla (JS Nativo fetch, cero permisos, cero API key) */}
        <div 
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-amber-50/80 border border-amber-200/70 px-2.5 py-1 rounded-full shadow-2xs"
          title={`Clima actual en Barranquilla: ${weather?.condition || 'Cargando...'} ${weather?.temperature ?? 31}°C`}
        >
          {renderWeatherIcon()}
          <span>{weather ? `${weather.temperature}°C` : '31°C'}</span>
          <span className="text-[10px] font-medium text-amber-800/80 hidden xs:inline">Baq</span>
        </div>
      </div>
    </header>
  );
};
