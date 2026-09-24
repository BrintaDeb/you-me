import React from 'react';
import './MarqueeRibbon.css';

interface MarqueeRibbonProps {
  items?: string[];
  tilt?: boolean;
  className?: string;
}

const DEFAULT_ITEMS = [
  'WEDDING',
  'CINEMATOGRAPHY',
  'PRE-WEDDING',
  'ANNIVERSARY',
  'RICE CEREMONY',
  'HEIRLOOM ALBUMS',
  'DOCUMENTARY STORIES',
  'TIMELESS EMOTION'
];

export const MarqueeRibbon: React.FC<MarqueeRibbonProps> = ({
  items = DEFAULT_ITEMS,
  tilt = true,
  className = ''
}) => {
  const repeatedText = items.join(' ✦ ') + ' ✦ ';

  return (
    <div
      className={`marquee-ribbon-container ${tilt ? 'tilted' : ''} ${className}`}
      aria-label="Studio craft highlights ticker"
    >
      <div className="marquee-track-wrapper">
        <div className="marquee-track-left">
          <span className="marquee-segment">{repeatedText}</span>
          <span className="marquee-segment" aria-hidden="true">{repeatedText}</span>
        </div>
      </div>
    </div>
  );
};
