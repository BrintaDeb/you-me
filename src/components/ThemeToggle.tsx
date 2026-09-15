import React, { useState } from 'react';
import { Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../context/useTheme';
import { triggerHaptic } from '../utils/haptics';
import './ThemeToggle.css';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

interface ThemeRipple {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, cycleTheme } = useTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [ripple, setRipple] = useState<ThemeRipple | null>(null);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic('light');

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const nextColor = theme === 'burgundy' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(125, 20, 45, 0.35)';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      setIsFlipping(true);
      setRipple({ id: Date.now(), x, y, color: nextColor });
      setTimeout(() => setIsFlipping(false), 350);
      setTimeout(() => setRipple(null), 650);
    }

    cycleTheme();
  };

  const getThemeInfo = () => {
    switch (theme) {
      case 'burgundy':
        return {
          icon: <Sparkles size={15} className="theme-icon icon-burgundy" />,
          label: 'Burgundy',
          title: 'Switch to White theme (Currently Burgundy)'
        };
      case 'white':
      default:
        return {
          icon: <Sun size={15} className="theme-icon icon-sun" />,
          label: 'White',
          title: 'Switch to Burgundy theme (Currently White)'
        };
    }
  };

  const current = getThemeInfo();

  return (
    <>
      {ripple && (
        <div
          key={ripple.id}
          className="theme-ripple-overlay"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            background: ripple.color,
          }}
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        className={`theme-cycle-toggle theme-${theme} ${isFlipping ? 'is-flipping' : ''} ${className}`}
        onClick={handleToggle}
        title={current.title}
        aria-label={`Current theme: ${current.label}. Click to switch theme.`}
      >
        <span className="theme-icon-slot">
          {current.icon}
        </span>
        <span className="theme-name-pill">{current.label}</span>
        {showLabel && <span className="theme-text-label">{current.label}</span>}
      </button>
    </>
  );
};
