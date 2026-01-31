import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import VideoAnalyzer from "./components/VideoAnalyzer";
import DocumentationView from "./components/DocumentationView";
import Dashboard from "./components/Dashboard";
import IntroAnimation from "./components/IntroAnimation";
import ChatWidget from "./components/ChatWidget";
import { AppMode } from "./types";

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.DASHBOARD:
        return <Dashboard setMode={setCurrentMode} />;
      case AppMode.DOCUMENTATION:
        return <DocumentationView />;
      case AppMode.VIDEO_ANALYSIS:
        return <VideoAnalyzer />;
      // Use ChatInterface for chat-based modes
      case AppMode.FAST_CHAT:
      case AppMode.SEARCH_GROUNDING:
      case AppMode.GENERAL_CHAT:
      case AppMode.RESEARCHER:
        return <ChatInterface mode={currentMode} />;
      default:
        return <ChatInterface mode={AppMode.GENERAL_CHAT} />;
    }
  };

  return (
    // Terminal Black Background
    <div className="flex h-screen bg-terminal-black text-phosphor-green font-mono relative overflow-hidden">
      {/* Grid Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00FF41 1px, transparent 1px), linear-gradient(90deg, #00FF41 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-terminal-black via-transparent to-transparent pointer-events-none"></div>

      {/* Intro Overlay */}
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}

      {/* Sidebar (Desktop) */}
      <Sidebar currentMode={currentMode} setMode={setCurrentMode} />

      {/* Sidebar (Mobile Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative bg-terminal-black w-3/4 max-w-xs h-full flex flex-col border-r border-phosphor-green/30 animate-slide-in-left shadow-[0_0_50px_rgba(0,255,65,0.2)]">
            <div className="p-4 border-b border-phosphor-green/30 flex justify-between items-center">
              <h2 className="font-bold text-phosphor-green tracking-widest text-glow">
                VIBE_GUIDER
              </h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-code-grey hover:text-phosphor-green transition-colors"
              >
                [X]
              </button>
            </div>
            <div className="flex flex-col p-3 gap-2 flex-1 overflow-y-auto">
              <button
                onClick={() => {
                  setCurrentMode(AppMode.DASHBOARD);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 text-left border border-transparent transition-all ${
                  currentMode === AppMode.DASHBOARD
                    ? "bg-dark-moss border-phosphor-green/50 text-phosphor-green"
                    : "text-code-grey hover:text-phosphor-green"
                }`}
              >
                &gt; DASHBOARD
              </button>
              <div className="h-px bg-phosphor-green/20 my-2"></div>

              {[
                { mode: AppMode.FAST_CHAT, label: "FAST_ANSWERS" },
                { mode: AppMode.SEARCH_GROUNDING, label: "GROUNDED_SEARCH" },
                { mode: AppMode.GENERAL_CHAT, label: "PRO_ASSISTANT" },
                { mode: AppMode.RESEARCHER, label: "THE_RESEARCHER" },
                { mode: AppMode.VIDEO_ANALYSIS, label: "VIDEO_ANALYSIS" },
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => {
                    setCurrentMode(item.mode as AppMode);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 text-left border border-transparent transition-all ${
                    currentMode === item.mode
                      ? "bg-dark-moss border-phosphor-green/50 text-phosphor-green"
                      : "text-code-grey hover:text-phosphor-green"
                  }`}
                >
                  &gt; {item.label}
                </button>
              ))}

              <div className="h-px bg-phosphor-green/20 my-2"></div>

              <button
                onClick={() => {
                  setCurrentMode(AppMode.DOCUMENTATION);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 text-left transition-all ${
                  currentMode === AppMode.DOCUMENTATION
                    ? "text-phosphor-green underline"
                    : "text-code-grey hover:text-phosphor-green"
                }`}
              >
                // DOCUMENTATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center p-4 border-b border-phosphor-green/20 bg-terminal-black/90 backdrop-blur-md z-10 sticky top-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-phosphor-green border border-phosphor-green/30 hover:bg-dark-moss rounded-sm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <span className="ml-3 font-bold text-lg text-phosphor-green tracking-wider text-glow">
            VIBE_GUIDER v2.1
          </span>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 overflow-hidden relative">{renderContent()}</div>
      </main>

      {/* Global Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default App;
