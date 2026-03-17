import { useState, useRef, useEffect } from 'react';
import { Flag } from '../../lib/flags/types';

interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  flags: Flag[];
  placeholder?: string;
  className?: string;
}

export function HighlightedTextarea({ value, onChange, flags, placeholder, className }: HighlightedTextareaProps) {
  const [hoveredFlag, setHoveredFlag] = useState<{ flag: Flag; x: number; y: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [value]);

  const handleScroll = () => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const renderHighlightedContent = () => {
    if (flags.length === 0 || !value) {
      return null;
    }

    const sortedFlags = [...flags].sort((a, b) => (a.position || 0) - (b.position || 0));
    const parts: Array<{ text: string; flag?: Flag }> = [];
    let currentPos = 0;

    for (const flag of sortedFlags) {
      const pos = flag.position || 0;
      const flagEnd = pos + (flag.excerpt.replace(/\.\.\./g, '').trim().length);

      if (pos > currentPos) {
        parts.push({ text: value.substring(currentPos, pos) });
      }

      const flaggedText = value.substring(pos, Math.min(flagEnd, value.length));
      if (flaggedText) {
        parts.push({ text: flaggedText, flag });
      }

      currentPos = Math.max(currentPos, flagEnd);
    }

    if (currentPos < value.length) {
      parts.push({ text: value.substring(currentPos) });
    }

    return parts.map((part, idx) => 
      part.flag ? (
        <mark
          key={idx}
          className={`${getSeverityHighlightClass(part.flag.severity)} cursor-help`}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredFlag({ 
              flag: part.flag!, 
              x: rect.left, 
              y: rect.bottom + 5 
            });
          }}
          onMouseLeave={() => setHoveredFlag(null)}
        >
          {part.text}
        </mark>
      ) : (
        <span key={idx}>{part.text}</span>
      )
    );
  };

  return (
    <div className="relative flex-1">
      <div
        ref={overlayRef}
        className={`absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words ${className}`}
        style={{ 
          color: 'transparent',
          caretColor: 'transparent',
        }}
      >
        <div className="pointer-events-auto">
          {renderHighlightedContent()}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        className={`relative bg-transparent ${className}`}
        style={{ color: 'inherit' }}
      />

      {hoveredFlag && (
        <div
          className="fixed z-50 bg-background border border-border px-3 py-2 shadow-lg max-w-xs"
          style={{ left: hoveredFlag.x, top: hoveredFlag.y }}
        >
          <div className={`text-xs font-semibold mb-1 ${getSeverityTextClass(hoveredFlag.flag.severity)}`}>
            {hoveredFlag.flag.severity}
          </div>
          <div className="text-xs text-text-primary">
            {hoveredFlag.flag.reason}
          </div>
        </div>
      )}
    </div>
  );
}

function getSeverityHighlightClass(severity: string): string {
  switch (severity) {
    case 'URGENT': return 'bg-red-500/20 underline decoration-red-500 decoration-wavy';
    case 'WATCH': return 'bg-yellow-500/20 underline decoration-yellow-500 decoration-wavy';
    case 'NOTE': return 'bg-blue-500/20 underline decoration-blue-500';
    default: return 'bg-gray-500/20';
  }
}

function getSeverityTextClass(severity: string): string {
  switch (severity) {
    case 'URGENT': return 'text-red-500';
    case 'WATCH': return 'text-yellow-500';
    case 'NOTE': return 'text-blue-500';
    default: return 'text-text-muted';
  }
}
