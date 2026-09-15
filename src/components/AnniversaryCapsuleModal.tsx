import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Sparkles,
  Gift,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { WeddingStory } from '../data/couplesData';
import { triggerHaptic } from '../utils/haptics';
import './AnniversaryCapsuleModal.css';

interface AnniversaryCapsuleModalProps {
  story: WeddingStory;
  isOpen: boolean;
  onClose: () => void;
}

const MILESTONES = [
  { year: 1, name: 'Paper', gift: 'Handmade Calligraphy Vow Book', desc: 'Symbolizes the blank page upon which your shared lifetime is written.' },
  { year: 2, name: 'Cotton', gift: 'Woven Fine-Art Tapestry', desc: 'Represents intertwining lives woven stronger together with each passing season.' },
  { year: 3, name: 'Leather', gift: 'Florentine Leather Folio', desc: 'Symbol of resilience, warmth, and protective shelter.' },
  { year: 5, name: 'Wood', gift: 'Handcrafted Teak Keepsake Box', desc: 'Deep-rooted strength and blossoming endurance across generations.' },
  { year: 10, name: 'Tin / Aluminum', gift: 'Embossed Metal Print', desc: 'Pliability and resistance to rust — defying the passage of time.' },
  { year: 25, name: 'Silver Jubilee', gift: 'Hallmarked Sterling Locket', desc: 'Radiant brilliance that grows more luminous with vintage patina.' },
  { year: 50, name: 'Golden Jubilee', gift: 'Pure 24K Gold Inlay Frame', desc: 'A sacred golden bond of everlasting adoration and generational wisdom.' }
];

export const AnniversaryCapsuleModal: React.FC<AnniversaryCapsuleModalProps> = ({
  story,
  isOpen,
  onClose
}) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Parse wedding date or fallback
  const weddingYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearsTogether = Math.max(1, currentYear - weddingYear);
  const nextMilestone = MILESTONES.find(m => m.year >= yearsTogether) || MILESTONES[0];

  const slides = story.images.slice(0, 8);

  useEffect(() => {
    if (!isOpen || !isPlaying || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, slides.length]);

  if (!isOpen) return null;

  return (
    <div className="anniversary-capsule-overlay" role="dialog" aria-modal="true" aria-label="Anniversary Time Capsule">
      <div className="anniversary-capsule-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="capsule-header-bar">
          <div className="capsule-header-left">
            <div className="capsule-eyebrow">
              <Sparkles size={14} className="gold-icon" />
              <span>Wedding Anniversary Time Capsule</span>
            </div>
            <h2 className="capsule-title">{story.title} &mdash; A Living Legacy of Love</h2>
          </div>

          <div className="capsule-header-controls">
            <button
              type="button"
              className="capsule-icon-btn"
              onClick={() => {
                setIsAudioMuted(prev => !prev);
                triggerHaptic('light');
              }}
              title={isAudioMuted ? 'Unmute ambient acoustic score' : 'Mute audio'}
            >
              {isAudioMuted ? <VolumeX size={17} /> : <Volume2 size={17} className="gold-icon" />}
            </button>

            <button
              type="button"
              className="capsule-icon-btn"
              onClick={() => {
                setIsPlaying(prev => !prev);
                triggerHaptic('light');
              }}
              title={isPlaying ? 'Pause slideshow' : 'Resume slideshow'}
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} />}
            </button>

            <button
              type="button"
              className="capsule-close-btn"
              onClick={onClose}
              aria-label="Close Time Capsule"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="capsule-content-grid">
          {/* Left Column: Visual Memory Reel */}
          <div className="capsule-memory-reel">
            {slides.length > 0 && (
              <div className="capsule-stage-frame">
                <img
                  src={slides[currentSlideIdx].url}
                  alt={slides[currentSlideIdx].alt}
                  className="capsule-image"
                />
                <div className="capsule-img-gradient" />

                <div className="capsule-caption-bar">
                  <span className="capsule-slide-count">{currentSlideIdx + 1} / {slides.length}</span>
                  <p className="capsule-slide-text">{slides[currentSlideIdx].caption || 'Sacred wedding memories preserved forever'}</p>
                </div>

                {/* Nav Arrows */}
                <button
                  type="button"
                  className="capsule-nav-arrow left"
                  onClick={() => {
                    setCurrentSlideIdx(prev => (prev - 1 + slides.length) % slides.length);
                    triggerHaptic('light');
                  }}
                  aria-label="Previous memory"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  className="capsule-nav-arrow right"
                  onClick={() => {
                    setCurrentSlideIdx(prev => (prev + 1) % slides.length);
                    triggerHaptic('light');
                  }}
                  aria-label="Next memory"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Anniversary Vow & Gift Guide */}
          <div className="capsule-milestone-panel">
            {/* Milestone Card */}
            <div className="milestone-highlight-card">
              <div className="milestone-badge-row">
                <span className="milestone-year-chip">Year {nextMilestone.year} Milestone</span>
                <span className="milestone-name-chip">{nextMilestone.name} Anniversary</span>
              </div>

              <h3 className="milestone-gift-title">
                <Gift size={18} className="gold-icon" />
                <span>Heirloom Gift: {nextMilestone.gift}</span>
              </h3>

              <p className="milestone-desc">{nextMilestone.desc}</p>
            </div>

            {/* Vow Letter */}
            <div className="anniversary-vow-card">
              <div className="vow-wax-seal">
                <Heart size={18} fill="#D4AF37" color="#D4AF37" />
              </div>
              <h4 className="vow-letter-heading">Studio Commemorative Dedication</h4>
              <p className="vow-letter-body">
                &ldquo;To {story.title}: As the seasons turn and years gently unfold, the sacred vows you whispered under the mandap grow deeper, richer, and more profound. These archival frames were preserved to bring you back to this golden day whenever you need to remember how boldly you began.&rdquo;
              </p>
              <span className="vow-sign-off">&mdash; Brinta &amp; The YOU &amp; ME Atelier</span>
            </div>

            {/* Anniversary Milestones Roadmap */}
            <div className="milestones-roadmap">
              <h4 className="roadmap-title">
                <Clock size={14} className="gold-icon" />
                <span>Tradition &amp; Modern Milestone Guide</span>
              </h4>
              <div className="milestones-scroll-track">
                {MILESTONES.map(m => (
                  <div
                    key={m.year}
                    className={`roadmap-item ${m.year === nextMilestone.year ? 'active' : ''}`}
                  >
                    <span className="item-year">Year {m.year}</span>
                    <span className="item-name">{m.name}</span>
                    <span className="item-gift">{m.gift}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
