import React, { useEffect, useRef, useState } from 'react';
import './LetterFlipHeading.css';

interface LetterFlipHeadingProps {
  prefix?: string;
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  align?: 'center' | 'left' | 'right';
  textColor?: string;
  prefixColor?: string;
  staggerMs?: number;
  delay?: number;
}

export const LetterFlipHeading: React.FC<LetterFlipHeadingProps> = ({
  prefix,
  text,
  as: Tag = 'h2',
  className = '',
  align = 'center',
  textColor,
  prefixColor,
  staggerMs = 65,
  delay = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isRevealed) return;

    let delayTimer: number;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              delayTimer = window.setTimeout(() => setIsRevealed(true), delay);
            } else {
              setIsRevealed(true);
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [delay, isRevealed]);

  const fullAriaLabel = prefix ? `${prefix} ${text}` : text;
  const characters = text.split('');

  return (
    <div
      ref={containerRef}
      className={`letter-flip-container align-${align} ${className}`}
      aria-label={fullAriaLabel}
    >
      {prefix && (
        <span
          className={`letter-flip-prefix ${isRevealed ? 'revealed' : ''}`}
          style={prefixColor ? { color: prefixColor } : undefined}
          aria-hidden="true"
        >
          {prefix}
        </span>
      )}

      <Tag
        className={`letter-flip-word ${isRevealed ? 'revealed' : ''}`}
        style={textColor ? { color: textColor } : undefined}
        aria-hidden="true"
      >
        {characters.map((char, index) => {
          const isSpace = char === ' ';
          return (
            <span
              key={`${char}-${index}`}
              className={`flip-letter-wrap ${isSpace ? 'space-char' : ''}`}
            >
              <span
                className="flip-letter-inner"
                style={{
                  transitionDelay: isRevealed ? `${index * staggerMs}ms` : '0ms'
                }}
              >
                {isSpace ? '\u00A0' : char}
              </span>
            </span>
          );
        })}
      </Tag>
    </div>
  );
};
