import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Route, Sparkles } from 'lucide-react';
import { AppTabId } from '../../types/place';
import { iosSpringSnappy } from '../../utils/physics';

interface TabItemConfig {
  id: AppTabId;
  label: string;
}

const TAB_ITEMS: TabItemConfig[] = [
  { id: 'home', label: 'Home' },
  { id: 'plan', label: 'Tu plan' },
  { id: 'quillabot', label: 'QuillaBot' },
];

export const BottomTabBar: React.FC = () => {
  // Estado puramente visual de la pestaña seleccionada (sin redirección ni lógica de rutas por ahora)
  const [activeTab, setActiveTab] = useState<AppTabId>('home');

  const renderIcon = (id: AppTabId, isActive: boolean) => {
    const strokeClass = isActive ? 'stroke-[2.25]' : 'stroke-[1.75]';

    switch (id) {
      case 'home':
        return <Home className={`w-[22px] h-[22px] ${strokeClass}`} />;
      case 'plan':
        return <Route className={`w-[22px] h-[22px] ${strokeClass}`} />;
      case 'quillabot':
        return <Sparkles className={`w-[22px] h-[22px] ${strokeClass}`} />;
    }
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 inset-x-0 z-40 w-full bg-white/80 backdrop-blur-xl saturate-180 border-t border-black/[0.06] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5"
    >
      <div className="max-w-md mx-auto px-4 grid grid-cols-3 gap-1">
        {TAB_ITEMS.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1 px-2 cursor-pointer select-none active:scale-95 transition-transform duration-100 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
                isActive
                  ? 'text-amber-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="iosBottomTabIndicator"
                  transition={iosSpringSnappy}
                  className="absolute inset-x-2 inset-y-0.5 rounded-2xl bg-amber-500/12 pointer-events-none"
                />
              )}

              <span className="relative z-10 flex items-center justify-center">
                {renderIcon(item.id, isActive)}
              </span>

              <span
                className={`relative z-10 text-[10px] leading-tight tracking-tight ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
