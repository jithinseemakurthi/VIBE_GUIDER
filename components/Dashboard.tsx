import React from 'react';
import { AppMode } from '../types';

interface DashboardProps {
  setMode: (mode: AppMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  const tools = [
    {
      mode: AppMode.FAST_CHAT,
      title: 'FAST_ANSWERS',
      description: 'Low latency response via Flash Lite model.',
      icon: '⚡',
    },
    {
      mode: AppMode.GENERAL_CHAT,
      title: 'PRO_ASSISTANT',
      description: 'Standard Gemini 3 Pro interface for complex tasks.',
      icon: '💬',
    },
    {
      mode: AppMode.SEARCH_GROUNDING,
      title: 'GROUNDED_SEARCH',
      description: 'Real-time web data injection via Google Search.',
      icon: '🌍',
    },
    {
      mode: AppMode.RESEARCHER,
      title: 'THE_RESEARCHER',
      description: 'Deep reasoning agent for complex logic and analysis.',
      icon: '🧠',
    },
    {
      mode: AppMode.VIDEO_ANALYSIS,
      title: 'VIDEO_ANALYSIS',
      description: 'Multimodal processing pipeline.',
      icon: '🎥',
    },
    {
      mode: AppMode.DOCUMENTATION,
      title: 'SYS_MANUAL',
      description: 'System architecture and usage guidelines.',
      icon: '📘',
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto scroll-smooth p-8">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        
        {/* Hero Section */}
        <div className="border border-phosphor-green/30 bg-dark-moss/50 p-8 relative overflow-hidden animate-fade-in">
           <div className="absolute top-0 right-0 p-2 text-xs text-code-grey border-l border-b border-phosphor-green/20">
              STATUS: ONLINE
           </div>
           
           <h1 className="text-4xl md:text-6xl font-bold text-phosphor-green tracking-tighter mb-4 text-glow">
            WELCOME_USER_1
           </h1>
           <p className="text-lg text-code-grey max-w-2xl font-mono leading-relaxed mb-8">
            &gt; The Vibe Guider workspace is ready.&lt;br/&gt;
            &gt; Select a module to begin operations.
          </p>
          
          <div className="flex gap-4">
            <button onClick={() => setMode(AppMode.GENERAL_CHAT)} className="bg-phosphor-green text-terminal-black px-6 py-3 font-bold hover:bg-phosphor-green/80 transition-all uppercase tracking-widest border border-phosphor-green">
              [INITIATE_CHAT]
            </button>
            <button onClick={() => setMode(AppMode.DOCUMENTATION)} className="bg-transparent text-phosphor-green px-6 py-3 font-bold hover:bg-phosphor-green/10 transition-all uppercase tracking-widest border border-phosphor-green">
              [READ_MANUAL]
            </button>
          </div>
        </div>

        {/* System Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, idx) => (
            <button
              key={tool.title}
              onClick={() => setMode(tool.mode)}
              style={{ animationDelay: `${idx * 100}ms` }}
              className="group relative flex flex-col items-start p-6 h-full text-left bg-terminal-black border border-code-grey hover:border-phosphor-green transition-all duration-200 hover:bg-dark-moss animate-slide-up opacity-0 fill-mode-forwards"
            >
              <div className="w-full flex justify-between items-start mb-4">
                 <div className="text-3xl text-phosphor-green group-hover:animate-bounce">{tool.icon}</div>
                 <div className="text-[10px] text-code-grey group-hover:text-phosphor-green">ID: {String(idx).padStart(2, '0')}</div>
              </div>
              
              <h3 className="text-xl font-bold text-phosphor-green mb-2 tracking-wider group-hover:text-glow">
                {tool.title}
              </h3>
              <p className="text-sm text-code-grey leading-relaxed font-mono">
                {tool.description}
              </p>
              
              <div className="mt-auto pt-6 w-full flex items-center justify-end text-xs font-bold text-phosphor-green uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                EXECUTE_
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-phosphor-green opacity-50 group-hover:opacity-100"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-phosphor-green opacity-50 group-hover:opacity-100"></div>
            </button>
          ))}
        </div>

        {/* Footer Terminal Stats */}
        <div className="mt-12 border-t border-phosphor-green/20 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-code-grey font-mono animate-fade-in">
           <p>VIBE_GUIDER [VERSION 2.1.0] - GOOGLE_GENAI_CONNECTED</p>
           <div className="flex gap-4 mt-2 md:mt-0">
              <span className="hover:text-phosphor-green cursor-pointer">[PRIVACY]</span>
              <span className="hover:text-phosphor-green cursor-pointer">[TERMS]</span>
              <span className="text-alert-amber blink">● LIVE</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;