import React, { useState, useRef, useEffect } from 'react';
import { generateFastResponse } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');

    try {
      // Prepare simple history for context
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const responseText = await generateFastResponse(history, userMsg.content);

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "ERROR: CONNECTION_FAILURE" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none ${isOpen ? 'z-[60]' : ''}`}>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto bg-terminal-black border border-phosphor-green w-80 md:w-96 h-96 mb-4 shadow-[0_0_20px_rgba(0,255,65,0.1)] flex flex-col animate-slide-up font-mono text-sm relative">
           {/* Header */}
           <div className="flex items-center justify-between p-2 bg-dark-moss border-b border-phosphor-green/30">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-alert-amber animate-pulse rounded-full"></div>
                 <span className="font-bold text-phosphor-green tracking-wider text-xs">QUICK_ASSIST :: FLASH-LITE</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-code-grey hover:text-phosphor-green transition-colors font-bold"
              >
                [MINIMIZE]
              </button>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="text-center text-code-grey text-xs mt-10">
                   <p>&gt; SYSTEM_READY</p>
                   <p>&gt; AWAITING_QUERY...</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`max-w-[85%] p-2 border ${msg.role === 'user' ? 'border-phosphor-green/50 bg-dark-moss/30 text-right' : 'border-code-grey bg-black text-left'}`}>
                      {msg.role === 'model' ? (
                          <div className="prose prose-invert prose-p:my-1 prose-pre:my-1 text-xs">
                             <MarkdownRenderer content={msg.content} />
                          </div>
                      ) : (
                          <span className="text-phosphor-green">{msg.content}</span>
                      )}
                   </div>
                   <span className="text-[9px] text-code-grey mt-1 uppercase">{msg.role}</span>
                </div>
              ))}
              
              {isLoading && (
                 <div className="text-phosphor-green text-xs animate-pulse">
                    &gt; PROCESSING...
                 </div>
              )}
           </div>

           {/* Input */}
           <form onSubmit={handleSubmit} className="p-2 border-t border-phosphor-green/30 bg-black flex gap-2">
              <span className="text-phosphor-green pt-2">&gt;</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ENTER_COMMAND..."
                className="flex-1 bg-transparent outline-none text-phosphor-green placeholder-code-grey"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="text-phosphor-green font-bold text-xs px-2 hover:bg-phosphor-green hover:text-black transition-colors disabled:opacity-50"
              >
                SEND
              </button>
           </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 bg-terminal-black border border-phosphor-green rounded-none flex items-center justify-center hover:bg-phosphor-green hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,65,0.2)] group"
      >
        {isOpen ? (
            <span className="text-2xl font-bold">_</span>
        ) : (
            <span className="text-2xl flex flex-col items-center">
                <span>?</span>
            </span>
        )}
        
        {!isOpen && (
            <div className="absolute right-full mr-4 bg-terminal-black border border-phosphor-green px-3 py-1 text-xs text-phosphor-green whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                OPEN_QUICK_ASSIST
            </div>
        )}
      </button>

    </div>
  );
};

export default ChatWidget;
