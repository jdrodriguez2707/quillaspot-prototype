import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-black/[0.06] bg-white/50 backdrop-blur-md py-6 px-4 text-center">
      <div className="max-w-md mx-auto flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span>Hecho con</span>
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 inline" />
          <span>pa' Barranquilla y el Atlántico</span>
        </div>
        <p className="text-[11px] text-slate-400 font-normal">
          QuillaSpot • Conectando visitantes con planes reales
        </p>
      </div>
    </footer>
  );
};
