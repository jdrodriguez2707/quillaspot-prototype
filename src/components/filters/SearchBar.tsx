import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onClear,
}) => {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-amber-600 pointer-events-none flex items-center z-10">
          <Search className="w-4 h-4 stroke-[2.5]" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, municipio (ej: Puerto Colombia)..."
          className="w-full pl-10 pr-9 py-2.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-2xs font-medium"
        />
        {searchTerm && (
          <button
            onClick={onClear}
            className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors active:scale-90 cursor-pointer"
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
