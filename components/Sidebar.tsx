import React from 'react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: AppMode.FAST_CHAT, label: 'FAST_ANSWERS', icon: '⚡', desc: 'SPEED: MAX' },
    { mode: AppMode.SEARCH_GROUNDING, label: 'GROUNDED_SEARCH', icon: '🌍', desc: 'WEB: CONNECTED' },
    { mode: AppMode.GENERAL_CHAT, label: 'PRO_ASSISTANT', icon: '💬', desc: 'MODEL: G3-PRO' },
    { mode: AppMode.RESEARCHER, label: 'THE_RESEARCHER', icon: '🧠', desc: 'REASONING: HIGH' },
    { mode: AppMode.VIDEO_ANALYSIS, label: 'VIDEO_ANALYST', icon: '🎥', desc: 'VISION: ON' },
  ];

  return (
    <aside className="w-72 bg-terminal-black border-r border-phosphor-green/20 flex flex-col hidden md:flex z-20 relative">
      
      <div className="p-6 border-b border-phosphor-green/20">
        <div className="cursor-pointer group" onClick={() => setMode(AppMode.DASHBOARD)}>
            <h1 className="text-2xl font-bold text-phosphor-green tracking-widest text-glow group-hover:animate-pulse">
              VIBE_GUIDER
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 bg-phosphor-green rounded-full animate-blink"></span>
               <p className="text-[10px] text-code-grey font-medium uppercase tracking-widest">SYSTEM ONLINE</p>
            </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        
        {/* Dashboard Link */}
        <button
            onClick={() => setMode(AppMode.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-3 py-3 mb-4 text-left border border-transparent transition-all duration-200
              ${currentMode === AppMode.DASHBOARD 
                ? 'bg-dark-moss border-phosphor-green text-phosphor-green shadow-[0_0_10px_rgba(0,255,65,0.1)]' 
                : 'text-code-grey hover:text-phosphor-green hover:border-phosphor-green/30'
              }`}
          >
            <span className="text-lg">::</span>
            <div className="font-bold tracking-wider text-sm">DASHBOARD</div>
        </button>

        <p className="px-3 text-[10px] font-bold text-code-grey uppercase tracking-widest mb-2 mt-4">MODULES</p>
        
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`w-full flex items-center gap-3 px-3 py-3 text-left border border-transparent transition-all duration-200
              ${currentMode === item.mode 
                ? 'bg-dark-moss border-phosphor-green text-phosphor-green shadow-[0_0_10px_rgba(0,255,65,0.1)]' 
                : 'text-code-grey hover:text-phosphor-green hover:border-phosphor-green/30'
              }`}
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm tracking-wider">{item.label}</div>
              <div className="text-[9px] uppercase opacity-70">
                {item.desc}
              </div>
            </div>
            {currentMode === item.mode && <span className="animate-blink">_</span>}
          </button>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-phosphor-green/20 bg-dark-moss/20">
        <button
          onClick={() => setMode(AppMode.DOCUMENTATION)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left border border-transparent transition-all
            ${currentMode === AppMode.DOCUMENTATION 
              ? 'text-phosphor-green border-phosphor-green/50 bg-dark-moss' 
              : 'text-code-grey hover:text-phosphor-green'
            }`}
        >
          <span className="text-lg">?</span>
          <span className="font-bold text-sm tracking-widest">MANUAL</span>
        </button>

        <div className="mt-3 text-[10px] text-code-grey text-center font-mono">
          CPU: 12% | MEM: 34%
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;