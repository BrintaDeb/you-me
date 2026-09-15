import React, { useState, useEffect } from 'react';
import { Volume2, Music } from 'lucide-react';
import { audioAtmosphere } from '../utils/audioAtmosphere';
import './AudioToggle.css';

import { triggerHaptic } from '../utils/haptics';

export const AudioToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(audioAtmosphere.getStatus().isPlaying);

  useEffect(() => {
    const unsub = audioAtmosphere.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  const handleToggle = () => {
    triggerHaptic('light');
    audioAtmosphere.toggle();
  };

  return (
    <button
      type="button"
      className={`audio-atmosphere-toggle ${isPlaying ? 'is-playing' : ''}`}
      onClick={handleToggle}
      title={
        isPlaying
          ? 'Mute Indian Wedding Instrumental Music'
          : 'Play Indian Wedding Instrumental Music'
      }
      aria-label={
        isPlaying
          ? 'Mute Indian wedding instrumental music'
          : 'Play Indian wedding instrumental music'
      }
      aria-pressed={isPlaying}
    >
      <span className="audio-icon-slot">
        {isPlaying ? (
          <Volume2 size={18} className="audio-icon icon-playing" />
        ) : (
          <Music size={18} className="audio-icon icon-idle" />
        )}
      </span>
    </button>
  );
};
