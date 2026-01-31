import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm text-phosphor-green font-mono leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed === '') return <div key={i} className="h-2" />;
        
        // Code Block look-alike
        if (trimmed.startsWith('```mermaid')) {
             return (
                 <div key={i} className="my-4 border border-code-grey bg-black p-4">
                    <div className="text-[10px] text-code-grey mb-2 border-b border-code-grey pb-1 uppercase">DIAGRAM_SOURCE</div>
                    <pre className="text-xs text-alert-amber overflow-x-auto whitespace-pre-wrap">
                        {trimmed.replace(/```mermaid/g, '').replace(/```/g, '')}
                    </pre>
                 </div>
             );
        }
        
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-phosphor-green mt-4 mb-2 uppercase tracking-wider underline decoration-code-grey underline-offset-4">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-phosphor-green mt-6 mb-2 uppercase tracking-widest border-b border-phosphor-green pb-1">{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-phosphor-green mt-6 mb-4 uppercase tracking-[0.2em] border-l-4 border-phosphor-green pl-4">{line.replace('# ', '')}</h1>;
        
        if (trimmed.startsWith('- ')) return <div key={i} className="flex gap-2 ml-4"><span className="text-alert-amber">&gt;&gt;</span><span className="flex-1">{formatText(line.replace('- ', ''))}</span></div>;
        if (trimmed.match(/^\d+\. /)) return <div key={i} className="flex gap-2 ml-4"><span className="text-alert-amber font-bold">{trimmed.match(/^\d+\. /)?.[0]}</span><span className="flex-1">{formatText(line.replace(/^\d+\. /, ''))}</span></div>;

        return (
          <p key={i}>
            {formatText(line)}
          </p>
        );
      })}
    </div>
  );
};

const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return (
        <>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-phosphor-green font-bold uppercase">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={j} className="text-xs bg-dark-moss text-alert-amber px-1 border border-code-grey">{part.slice(1, -1)}</code>;
              }
              return part;
            })}
        </>
    )
}

export default MarkdownRenderer;