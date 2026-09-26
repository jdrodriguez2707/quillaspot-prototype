import React from 'react';
import { Heart, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-zinc-200 bg-white py-6 px-4 text-center">
      <div className="max-w-md mx-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
          <span>Hecho con</span>
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 inline" />
          <span>pa' Barranquilla y el Atlántico</span>
        </div>
        <p className="text-[11px] text-zinc-400">
          QuillaSpot • Cero Login • Conectando visitantes con planes reales
        </p>
      </div>
    </footer>
  );
};
