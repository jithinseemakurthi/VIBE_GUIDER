import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

type DocSection = 'readme' | 'architecture' | 'strategy';

const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<DocSection>('readme');

  const tabs: { id: DocSection; label: string; icon: string }[] = [
    { id: 'readme', label: 'README.MD', icon: '📄' },
    { id: 'architecture', label: 'ARCH_DIAGRAM', icon: '📐' },
    { id: 'strategy', label: 'LOGIC_CORE', icon: '🧠' },
  ];

  const readmeContent = `
# SYSTEM MANUAL v2.1

## VIBE_GUIDER WORKSPACE

Operational workspace for interacting with Google GenAI models (Gemini 3 / 2.5).

### CAPABILITIES
- **FAST_ANSWERS**: Low-latency query resolution via \`gemini-2.5-flash-lite\`.
- **GROUNDED_SEARCH**: Web-augmented generation using \`gemini-3-flash\`.
- **PRO_ASSISTANT**: Complex reasoning via \`gemini-3-pro\`.
- **THE_RESEARCHER**: Extended compute budget allocation for logic tasks.
- **VIDEO_ANALYSIS**: Multimodal ingestion pipeline.
`;

  const architectureContent = `
# SYSTEM_ARCHITECTURE

Component-based React application interfacing with Google GenAI SDK.

\`\`\`mermaid
graph TD
    UI[Terminal UI] -->|ROUTING| Core{App Controller}
    Core -->|FAST| SvcFast[Flash Lite Svc]
    Core -->|SEARCH| SvcSearch[Search Tool Svc]
    Core -->|THINK| SvcThink[Reasoning Svc]
    Core -->|VISION| SvcVision[Vision Svc]
    
    SvcFast --> API[Google GenAI API]
    SvcSearch --> API
    SvcThink --> API
    SvcVision --> API
\`\`\`
`;

  const strategyContent = `
# OPERATIONAL_LOGIC

### DESIGN_PHILOSOPHY
Modular service architecture abstracting model complexity. Strict separation of concerns between UI (Terminal) and Logic (Services).

### CORE_PROTOCOLS
1.  **ROUTING**: Context-aware model selection based on user intent.
2.  **STATELESSNESS**: API services remain pure; state managed by React Controller.
3.  **NORMALIZATION**: Data payloads standardized before API transmission.
`;

  const getContent = () => {
    switch (activeSection) {
      case 'readme': return readmeContent;
      case 'architecture': return architectureContent;
      case 'strategy': return strategyContent;
      default: return readmeContent;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono">
      {/* Header / Tabs */}
      <div className="flex-shrink-0 p-6 pb-0 max-w-4xl mx-auto w-full z-10 border-b border-code-grey/30">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-t border-l border-r transition-all
                ${activeSection === tab.id 
                  ? 'bg-dark-moss border-phosphor-green text-phosphor-green' 
                  : 'bg-terminal-black border-code-grey text-code-grey hover:text-phosphor-green'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto w-full animate-fade-in">
          <div className="bg-terminal-black border border-code-grey p-8 shadow-none min-h-[500px]">
             <MarkdownRenderer content={getContent()} />
          </div>
          
          <div className="mt-4 text-right text-[10px] text-code-grey uppercase">
            DOC_VER: 2.1.0 // LAST_UPDATED: NOW
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationView;