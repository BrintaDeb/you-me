import React, { useState, useEffect } from 'react';
import { Volume2, Music } from 'lucide-react';
import { audioAtmosphere } from '../utils/audioAtmosphere';
import './AudioToggle.css';

export const AudioToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(audioAtmosphere.getStatus().isPlaying);

  useEffect(() => {
    const unsub = audioAtmosphere.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  return (
    <button
      type="button"
      className={`audio-atmosphere-toggle ${isPlaying ? 'is-playing' : ''}`}
      onClick={() => audioAtmosphere.toggle()}
      title={
        isPlaying
          ? 'Mute Indian Wedding Instrumental Music'
          : 'Listen to Indian Wedding Instrumental Music (Audio Only)'
      }
      aria-label={
        isPlaying
          ? 'Mute Indian wedding instrumental music'
          : 'Play Indian wedding instrumental music'
      }
      aria-pressed={isPlaying}
    >
      <div className="audio-icon-wrap">
        {isPlaying ? <Volume2 size={15} /> : <Music size={14} />}
      </div>

      <div className="audio-wave-bars" aria-hidden="true">
        <span className="wave-bar bar-1" />
        <span className="wave-bar bar-2" />
        <span className="wave-bar bar-3" />
      </div>

      <span className="audio-toggle-text">
        {isPlaying ? 'Playing Audio' : 'Wedding Music'}
      </span>
    </button>
  );
};
