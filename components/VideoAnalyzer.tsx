import React, { useState, useRef } from 'react';
import { analyzeVideoContent } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const VideoAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(''); // Clear previous result
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const analysis = await analyzeVideoContent(prompt, base64Data, file.type);
        setResult(analysis);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setResult("ERROR: FILE_READ_FAILED");
        setIsLoading(false);
      };
    } catch (error) {
      setResult("ERROR: ANALYSIS_FAILED");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="border-l-4 border-phosphor-green pl-4">
          <h2 className="text-2xl font-bold text-phosphor-green tracking-widest">
            VIDEO_INTELLIGENCE_UNIT
          </h2>
          <p className="text-code-grey text-sm font-mono mt-1">
            &gt; UPLOAD_CLIP :: ANALYZE :: EXTRACT_DATA
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="space-y-6">
            <div 
              className={`border-2 border-dashed rounded-none p-8 flex flex-col items-center justify-center text-center transition-all h-64 relative overflow-hidden cursor-pointer
                ${file ? 'border-phosphor-green bg-dark-moss/20' : 'border-code-grey hover:border-phosphor-green hover:bg-dark-moss/10'}
              `}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="video/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange} 
              />
              
              {file ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
                   <video src={preview || ''} controls className="max-h-48 border border-phosphor-green/30" />
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      setResult('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-alert-amber hover:text-phosphor-green underline mt-2 font-mono uppercase"
                   >
                    [REMOVE_FILE]
                   </button>
                </div>
              ) : (
                <>
                  <div className="text-4xl text-code-grey mb-4 font-thin">+</div>
                  <p className="text-phosphor-green font-bold tracking-widest">[CLICK_TO_UPLOAD]</p>
                  <p className="text-code-grey text-xs mt-2">SUPPORTED: MP4, WEBM, MOV</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-phosphor-green uppercase">Analysis_Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="DEFINE_ANALYSIS_PARAMETERS..."
                className="w-full bg-black border border-code-grey focus:border-phosphor-green rounded-none p-3 text-phosphor-green outline-none h-24 resize-none font-mono placeholder-code-grey"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || isLoading}
              className="w-full bg-phosphor-green hover:bg-phosphor-green/90 text-black py-4 font-bold tracking-widest uppercase disabled:bg-code-grey disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'PROCESSING_VIDEO_DATA...' : 'INITIATE_ANALYSIS'}
            </button>
          </div>

          {/* Right: Output */}
          <div className="border border-code-grey bg-terminal-black p-6 min-h-[400px] relative">
            <div className="absolute top-0 left-0 bg-code-grey text-black text-[10px] px-2 py-1 font-bold">OUTPUT_LOG</div>
            
            <div className="mt-6 h-full overflow-y-auto">
                {isLoading ? (
                <div className="space-y-2 animate-pulse text-phosphor-green text-xs font-mono">
                    <p>&gt; READING_FRAMES...</p>
                    <p>&gt; EXTRACTING_FEATURES...</p>
                    <p>&gt; GENERATING_SUMMARY...</p>
                </div>
                ) : result ? (
                <div className="prose prose-invert max-w-none prose-code:text-phosphor-green">
                    <MarkdownRenderer content={result} />
                </div>
                ) : (
                <p className="text-code-grey italic text-sm text-center mt-20">
                    NO_DATA_AVAILABLE
                </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalyzer;