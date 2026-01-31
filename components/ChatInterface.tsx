import React, { useState, useRef, useEffect } from 'react';
import { AppMode, Message, GroundingChunk, Attachment } from '../types';
import { generateFastResponse, generateChatResponse, generateGroundedResponse, generateThinkingResponse } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatInterfaceProps {
  mode: AppMode;
}

const SUGGESTED_PROMPTS: Record<AppMode, string[]> = {
  [AppMode.DASHBOARD]: [], 
  [AppMode.FAST_CHAT]: ["Explain quantum computing", "Write a haiku about React", "Top 5 tips for Linux"],
  [AppMode.SEARCH_GROUNDING]: ["Stock price of Google", "Latest fusion energy news", "Weather in Tokyo"],
  [AppMode.GENERAL_CHAT]: ["Draft professional email", "Debug React hook", "Paris itinerary 3 days"],
  [AppMode.RESEARCHER]: ["Solve Three Gods riddle", "Analyze AI job impact", "Design Twitter architecture"],
  [AppMode.VIDEO_ANALYSIS]: ["Describe this scene", "Detect objects in video", "Generate a summary of events"], 
  [AppMode.DOCUMENTATION]: []
};

const getModelDisplay = (mode: AppMode) => {
  switch (mode) {
    case AppMode.FAST_CHAT: return 'GEMINI_FLASH_LITE';
    case AppMode.SEARCH_GROUNDING: return 'GEMINI_3_FLASH';
    case AppMode.RESEARCHER: return 'GEMINI_3_PRO_THINKING';
    case AppMode.VIDEO_ANALYSIS: return 'GEMINI_3_PRO_VISION';
    case AppMode.GENERAL_CHAT: return 'GEMINI_3_PRO';
    default: return 'GEMINI_MODEL';
  }
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // New state for Drag & Drop and Progress
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setSelectedFile(null);
    setUploadError(null);
    setIsProcessingFile(false);
    setUploadProgress(0);
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const processFile = (file: File) => {
    setUploadError(null);
    setIsProcessingFile(true);
    setUploadProgress(0);

    // Limit video size to ~20MB to prevent browser crash on base64
    if (file.type.startsWith('video/') && file.size > 20 * 1024 * 1024) {
      setUploadError("ERROR: FILE_TOO_LARGE. VIDEO_LIMIT_20MB.");
      setIsProcessingFile(false);
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    reader.onerror = () => {
      setUploadError("ERROR: FILE_READ_FAILED. DATA_CORRUPTED_OR_ACCESS_DENIED.");
      setSelectedFile(null);
      setIsProcessingFile(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        const content = (isImage || isVideo) ? reader.result.split(',')[1] : reader.result;
        setSelectedFile({
            type: isImage ? 'image' : isVideo ? 'video' : 'text',
            content: content,
            mimeType: file.type || 'text/plain',
            name: file.name
        });
      }
      setIsProcessingFile(false);
      setUploadProgress(100);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    try {
        if (isImage || isVideo) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    } catch (err) {
        console.error("Error starting file read", err);
        setUploadError("ERROR: SYSTEM_EXCEPTION_DURING_UPLOAD.");
        setSelectedFile(null);
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading || isProcessingFile) return;

    const userMsg: Message = { 
      role: 'user', 
      content: input, 
      attachment: selectedFile || undefined,
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');
    setSelectedFile(null);
    setUploadError(null);
    setUploadProgress(0);

    try {
      let responseText = '';
      let groundingData;

      // Prepare History for Context-Aware Chat
      const history = messages.map(m => {
        const parts: any[] = [];
        if (m.attachment) {
          if (m.attachment.type === 'image' || m.attachment.type === 'video') {
            parts.push({ inlineData: { mimeType: m.attachment.mimeType, data: m.attachment.content } });
          } else if (m.attachment.type === 'text') {
            parts.push({ text: `[Attached File: ${m.attachment.name}]\n${m.attachment.content}\n\n` });
          }
        }
        parts.push({ text: m.content });
        return { role: m.role, parts };
      });

      if (mode === AppMode.FAST_CHAT) {
        responseText = await generateFastResponse(history, userMsg.content, userMsg.attachment);
      } else if (mode === AppMode.GENERAL_CHAT || mode === AppMode.VIDEO_ANALYSIS) {
        responseText = await generateChatResponse(history, userMsg.content, userMsg.attachment);
      } else if (mode === AppMode.SEARCH_GROUNDING) {
        const result = await generateGroundedResponse(history, userMsg.content, userMsg.attachment);
        responseText = result.text;
        groundingData = result.groundingMetadata;
      } else if (mode === AppMode.RESEARCHER) {
        responseText = await generateThinkingResponse(history, userMsg.content, userMsg.attachment);
      }

      setMessages(prev => [
        ...prev,
        { 
          role: 'model', 
          content: responseText, 
          groundingMetadata: groundingData,
          timestamp: Date.now() 
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'model', content: "ERROR: PROCESSING_FAILED.", error: true, timestamp: Date.now() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative font-mono text-sm">
      {/* Header */}
      <div className="p-4 border-b border-phosphor-green/20 bg-terminal-black z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-phosphor-green flex items-center gap-2 uppercase tracking-widest">
            [{mode === AppMode.RESEARCHER ? 'THE_RESEARCHER' : mode}]
            {mode === AppMode.FAST_CHAT && <span className="text-alert-amber">::LITE</span>}
            {mode === AppMode.SEARCH_GROUNDING && <span className="text-phosphor-green">::WEB</span>}
            {mode === AppMode.VIDEO_ANALYSIS && <span className="text-alert-amber">::VISION</span>}
          </h2>
          <p className="text-xs text-code-grey mt-1">
            TARGET: {getModelDisplay(mode)} | STATUS: READY
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in opacity-50">
            <div className="p-6 border border-phosphor-green/30 rounded-none bg-dark-moss/30">
              <span className="text-4xl text-phosphor-green animate-pulse">_</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-phosphor-green mb-2 tracking-widest">AWAITING_INPUT</h3>
              <p className="text-code-grey max-w-md mx-auto">
                &gt; System ready to process natural language queries.&lt;br/&gt;
                &gt; Select prompt or initiate manually.
              </p>
            </div>
            
            {/* Suggested Prompts */}
            <div className="grid gap-3 w-full max-w-lg">
              {SUGGESTED_PROMPTS[mode]?.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(prompt)}
                  className="p-3 border border-code-grey hover:border-phosphor-green hover:bg-dark-moss text-left text-xs text-phosphor-green transition-all font-mono group"
                >
                  <span className="text-code-grey group-hover:text-phosphor-green mr-2">{'>'}</span> {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col animate-slide-up ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`text-[10px] mb-1 uppercase tracking-wider ${msg.role === 'user' ? 'text-phosphor-green' : 'text-alert-amber'}`}>
              {msg.role === 'user' ? 'USER_INPUT' : 'SYSTEM_RESPONSE'} :: {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            
            <div className={`max-w-[90%] md:max-w-[80%] border p-4 shadow-none ${
              msg.role === 'user' 
                ? 'bg-dark-moss border-phosphor-green text-phosphor-green' 
                : 'bg-terminal-black border-code-grey text-phosphor-green'
            }`}>
              {/* Attachment Display in History */}
              {msg.attachment && (
                <div className="mb-4">
                  {msg.attachment.type === 'image' ? (
                    <img 
                      src={`data:${msg.attachment.mimeType};base64,${msg.attachment.content}`} 
                      alt="User upload" 
                      className="max-h-64 border border-phosphor-green/50 opacity-80"
                    />
                  ) : msg.attachment.type === 'video' ? (
                    <div className="border border-phosphor-green/50 opacity-80 bg-black max-w-xs relative group">
                        <video 
                            src={`data:${msg.attachment.mimeType};base64,${msg.attachment.content}`} 
                            className="max-h-64 w-auto"
                            controls
                        />
                        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[10px] text-phosphor-green border border-phosphor-green/30">
                            VIDEO
                        </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-black/50 p-2 border border-code-grey font-mono text-xs">
                      <span>[FILE]</span>
                      <span className="truncate max-w-[200px]">{msg.attachment.name}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="prose prose-invert max-w-none leading-relaxed font-mono text-sm">
                 {msg.role === 'model' ? <MarkdownRenderer content={msg.content} /> : <div className="whitespace-pre-wrap">{msg.content}</div>}
              </div>

              {/* Grounding Sources */}
              {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-phosphor-green/20">
                  <p className="text-[10px] text-code-grey mb-2 uppercase tracking-widest">
                    [SOURCES_DETECTED]
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingMetadata.groundingChunks.map((chunk: GroundingChunk, cIdx: number) => (
                      chunk.web?.uri && (
                        <a 
                          key={cIdx}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] bg-dark-moss hover:bg-phosphor-green hover:text-black text-phosphor-green px-2 py-1 border border-phosphor-green/30 transition-colors truncate max-w-[220px]"
                        >
                          [LINK] {chunk.web.title || new URL(chunk.web.uri).hostname}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-terminal-black border border-code-grey p-4 flex items-center gap-2 text-phosphor-green">
              <span className="animate-blink">█</span>
              <span className="text-xs font-mono uppercase tracking-wider">
                PROCESSING_REQUEST...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area / Drop Zone */}
      <div 
        className={`p-4 border-t border-phosphor-green/20 relative z-20 transition-all duration-300 ${
          isDragging 
            ? 'bg-dark-moss border-2 border-dashed border-phosphor-green' 
            : 'bg-terminal-black'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-moss/95 z-50 pointer-events-none backdrop-blur-sm transition-all">
             <div className="border-2 border-phosphor-green border-dashed p-10 animate-pulse bg-terminal-black/80 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(0,255,65,0.1)]">
                <span className="text-4xl">📂</span>
                <span className="text-phosphor-green text-xl font-bold tracking-widest">[DROP_FILE_TO_UPLOAD]</span>
             </div>
             <div className="mt-4 text-phosphor-green text-xs font-mono uppercase tracking-wider bg-black border border-phosphor-green/30 px-3 py-1">
                ACCEPTED: VIDEO (MP4, WEBM), IMAGES, TEXT, CODE
             </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto relative">
          
          {/* Progress Bar */}
          {isProcessingFile && (
             <div className="absolute bottom-full left-0 w-full mb-2 z-40">
                <div className="flex justify-between text-[10px] text-phosphor-green mb-1 uppercase font-bold">
                    <span>UPLOADING_DATA...</span>
                    <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1 bg-code-grey overflow-hidden">
                    <div 
                       className="h-full bg-phosphor-green transition-all duration-100 ease-out"
                       style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
             </div>
          )}

          {/* Upload Error Display */}
          {uploadError && !isProcessingFile && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-dark-moss border border-alert-amber p-2 flex items-center justify-between animate-fade-in z-30">
              <div className="flex items-center gap-2 text-alert-amber">
                <span className="font-bold text-lg">!</span>
                <span className="text-xs uppercase tracking-wider font-bold">{uploadError}</span>
              </div>
              <button 
                onClick={() => setUploadError(null)} 
                className="text-alert-amber hover:text-phosphor-green px-2 font-bold"
              >
                [DISMISS]
              </button>
            </div>
          )}

          {/* File Preview */}
          {selectedFile && !isProcessingFile && (
            <div className="absolute bottom-full mb-2 left-0 bg-dark-moss border border-phosphor-green p-2 flex items-center gap-4 animate-fade-in z-30">
              {selectedFile.type === 'image' ? (
                <div className="h-8 w-8 relative overflow-hidden bg-black border border-phosphor-green/50">
                  <img 
                    src={`data:${selectedFile.mimeType};base64,${selectedFile.content}`} 
                    className="object-cover w-full h-full grayscale" 
                    alt="preview"
                  />
                </div>
              ) : selectedFile.type === 'video' ? (
                <div className="h-8 w-8 relative overflow-hidden bg-black border border-phosphor-green/50 flex items-center justify-center">
                    <div className="text-[8px] text-phosphor-green">VID</div>
                </div>
              ) : (
                <div className="text-phosphor-green text-xs">[TXT]</div>
              )}
              <div className="text-xs text-phosphor-green max-w-[200px] truncate">{selectedFile.name}</div>
              <button onClick={removeFile} className="text-phosphor-green hover:bg-phosphor-green hover:text-black px-2 text-xs font-bold uppercase transition-colors">[REMOVE]</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 relative">
               <input
                 type="file"
                 ref={fileInputRef}
                 className="hidden"
                 onChange={handleFileSelect}
                 accept="image/*,video/*,text/*,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.html,.css,.json,.md,.txt,.csv"
               />

               <div className="relative group">
                   <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingFile}
                    className="h-full px-4 border border-code-grey hover:border-phosphor-green hover:bg-dark-moss text-phosphor-green transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                   >
                     <span className="text-xl font-bold">+</span>
                   </button>
                   {/* Tooltip */}
                   <div className="absolute bottom-full left-0 mb-2 w-48 bg-terminal-black border border-phosphor-green p-2 text-[10px] text-code-grey hidden group-hover:block z-50 shadow-lg pointer-events-none">
                      <p className="text-phosphor-green font-bold mb-1 border-b border-code-grey pb-1 uppercase tracking-wider">UPLOAD_FILE</p>
                      <p className="leading-tight">Supports: Video (MP4, WEBM &lt; 20MB), Images (PNG, JPG), Code, Text.</p>
                   </div>
               </div>

              <div className="flex-1 relative">
                <span className="absolute left-3 top-3 text-phosphor-green">{'>'}</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isProcessingFile ? "PLEASE_WAIT..." : 
                    mode === AppMode.RESEARCHER ? "INPUT_COMPLEX_QUERY..." : "ENTER_COMMAND..."
                  }
                  className="w-full bg-black border border-code-grey focus:border-phosphor-green text-phosphor-green placeholder-code-grey py-3 pl-8 pr-2 focus:outline-none font-mono transition-colors"
                  disabled={isLoading || isProcessingFile}
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedFile) || isProcessingFile}
                className="px-6 bg-phosphor-green hover:bg-phosphor-green/80 text-black font-bold uppercase tracking-widest disabled:bg-code-grey disabled:cursor-not-allowed transition-all"
              >
                SEND
              </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;