import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [isExit, setIsExit] = useState(false);

  useEffect(() => {
    const bootSequence = [
      "INITIALIZING VIBE_GUIDER KERNEL...",
      "LOADING NEURAL MODULES [GEMINI 3 PRO]...",
      "ESTABLISHING SECURE CONNECTION...",
      "GROUNDING SUBSYSTEMS: ONLINE",
      "VIDEO PROCESSING UNIT: READY",
      "ACCESS GRANTED."
    ];

    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += 300 + Math.random() * 400;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
      }, delay);
    });

    setTimeout(() => {
      setIsExit(true);
      setTimeout(onComplete, 500);
    }, delay + 800);

  }, [onComplete]);

  if (isExit) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-terminal-black flex flex-col items-start justify-end p-8 md:p-16 overflow-hidden font-mono text-phosphor-green">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0A0A0A_90%)] z-10 pointer-events-none"></div>
      
      <div className="relative z-20 w-full max-w-3xl space-y-2">
        {lines.map((line, idx) => (
          <div key={idx} className="text-sm md:text-xl tracking-wider">
            <span className="text-code-grey mr-2">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-glow">{line}</span>
          </div>
        ))}
        <div className="animate-blink text-xl text-phosphor-green">_</div>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-phosphor-green/50"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-phosphor-green/50"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-phosphor-green/50"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-phosphor-green/50"></div>
    </div>
  );
};

export default IntroAnimation;