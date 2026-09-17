import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/useTheme';
import { hapticTheme } from '../utils/haptics';
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

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, cycleTheme } = useTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [ripple, setRipple] = useState<ThemeRipple | null>(null);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    hapticTheme();

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

  const isDark = theme === 'burgundy';
  const currentLabel = isDark ? 'Burgundy' : 'White';
  const nextThemeTitle = isDark ? 'Switch to White Theme' : 'Switch to Burgundy Theme';

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
        data-magnetic
        className={`theme-cycle-toggle theme-icon-toggle theme-${theme} ${isFlipping ? 'is-flipping' : ''} ${className}`}
        onClick={handleToggle}
        title={nextThemeTitle}
        aria-label={`Current theme: ${currentLabel}. Click to ${nextThemeTitle.toLowerCase()}.`}
      >
        <span className="theme-icon-slot">
          {isDark ? (
            <Moon size={18} className="theme-icon icon-moon" />
          ) : (
            <Sun size={18} className="theme-icon icon-sun" />
          )}
        </span>
      </button>
    </>
  );
};
