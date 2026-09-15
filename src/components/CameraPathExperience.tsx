import React, { useEffect, useRef, useState } from 'react';
import { Play, ArrowRight, Sparkles, Film, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { featuredStories } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { businessInfo } from '../data/businessData';
import { useTheme } from '../context/useTheme';
import './CameraPathExperience.css';

interface CameraPathExperienceProps {
  onSelectStory: (story: WeddingStory) => void;
  onPlayFilm: (story: WeddingStory) => void;
}

interface HeroSlide {
  image: string;
  alt: string;
  couple: string;
  location: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    image: '/assets/posters/paraj_mrinmoyee.jpg',
    alt: 'Paraj & Mrinmoyee romantic wedding celebration',
    couple: 'Paraj & Mrinmoyee',
    location: 'Calcutta Classical'
  },
  {
    image: '/assets/posters/urmi_jasraj.jpg',
    alt: 'Jasraj & Urmi royal evening pheras celebration',
    couple: 'Jasraj & Urmi',
    location: 'Rajasthan Royal Heritage'
  },
  {
    image: '/assets/posters/avik_binita.jpg',
    alt: 'Avik & Binita joyful day ceremony',
    couple: 'Avik & Binita',
    location: 'Kolkata Celebration'
  },
  {
    image: '/assets/posters/ankita_subhadeep.jpg',
    alt: 'Subhadeep & Ankita sacred rituals and vows',
    couple: 'Subhadeep & Ankita',
    location: 'Traditional Bengali Wedding'
  },
  {
    image: '/assets/posters/suchi_hira.jpg',
    alt: 'Hira & Suchi timeless wedding reception',
    couple: 'Hira & Suchi',
    location: 'Grand Heritage Palace'
  }
];

export const CameraPathExperience: React.FC<CameraPathExperienceProps> = ({
  onSelectStory,
  onPlayFilm
}) => {
  const { theme } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [letterboxActive, setLetterboxActive] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroRevealed(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Activate letterbox bars when 3D storyboard is in view
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const target = document.getElementById('camera-journey');
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setLetterboxActive(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Auto-advance hero background images in intervals of 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let animFrame: number;
    let targetProgress = 0;
    let currentProgress = 0;

    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackHeight = trackRef.current.offsetHeight - window.innerHeight;
      if (trackHeight <= 0) return;

      const raw = -rect.top / trackHeight;
      targetProgress = Math.max(0, Math.min(1, raw));
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized mouse coordinates from -1 to 1 for interactive 3D parallax
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    const updateLoop = () => {
      // Silky lerp interpolation for 60fps cinematic fluidity
      currentProgress += (targetProgress - currentProgress) * 0.1;
      setScrollProgress(currentProgress);

      // Determine active story index based on progress (0 to total-1)
      const total = featuredStories.length;
      const idx = Math.min(total - 1, Math.max(0, Math.round(currentProgress * (total - 1))));
      setActiveStoryIdx(idx);

      animFrame = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animFrame = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  const jumpToStory = (index: number) => {
    if (!trackRef.current) return;
    const trackTop = trackRef.current.getBoundingClientRect().top + window.scrollY;
    const trackHeight = trackRef.current.offsetHeight - window.innerHeight;
    const targetScroll = trackTop + (index / (featuredStories.length - 1)) * trackHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  const totalStories = featuredStories.length;

  return (
    <div className={`camera-path-container${letterboxActive ? ' letterbox-active' : ''}`} id="stories">
      {/* Cinematic letterbox bars */}
      <div className="letterbox-bar letterbox-bar-top" aria-hidden="true" />
      <div className="letterbox-bar letterbox-bar-bottom" aria-hidden="true" />
      {/* Scene 1 — Cinematic Opening */}
      <section className="hero-scene" aria-label="Hero Wedding Showcase">
        <div className="hero-background-wrapper" aria-hidden="true">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = currentSlide === idx;
            return (
              <div
                key={slide.image}
                className={`hero-slide-layer ${isActive ? 'active' : ''}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="hero-slide-img"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : undefined}
                />
              </div>
            );
          })}
          <div className="hero-overlay-gradient" />
        </div>

        <div className={`hero-content ${heroRevealed ? 'text-revealed' : ''}`}>
          <div className="hero-logo-badge">
            <img
              src={theme === 'white' ? "/assets/brand/logo_black.png" : "/assets/brand/logo_white.png"}
              alt={businessInfo.name}
              className="hero-logo-img"
              width="240"
              height="74"
            />
          </div>

          <div className="eyebrow">
            <Sparkles size={14} /> Wedding Stories, Honestly Told
          </div>

          <h1 className="hero-heading">
            Love, Remembered in Every Frame
          </h1>

          <p className="hero-tagline">
            Documentary wedding photography shaped by warmth, emotion, and artistry. Scripting your visual love stories into timeless heirloom art.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const el = document.getElementById('camera-journey');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Our Stories <ArrowRight size={16} />
            </button>
            <a
              href="#contact"
              className="btn btn-outline"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Check Your Date
            </a>
          </div>

          {/* Discreet Hero Carousel Indicators (5-Second Interval Progress) */}
          <div className="hero-carousel-controls" role="tablist" aria-label="Hero background slides switcher">
            <div className="hero-carousel-dots">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={slide.image}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Switch to slide ${idx + 1}: ${slide.couple}`}
                    className={`hero-carousel-dot ${isActive ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                  >
                    <span className="dot-progress" />
                  </button>
                );
              })}
            </div>
            <div className="hero-slide-badge" aria-live="polite">
              <span className="slide-badge-dot" />
              <span className="slide-badge-name">{HERO_SLIDES[currentSlide].couple}</span>
              <span className="slide-badge-sep">•</span>
              <span className="slide-badge-loc">{HERO_SLIDES[currentSlide].location}</span>
            </div>
          </div>
        </div>

        <div className="scroll-indicator" aria-hidden="true">
          <span>Scroll into the Storyboard</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* Scene 2 — 3D Camera-Path Space (Selected Stories Multi-Plane Exhibition) */}
      <section
        ref={trackRef}
        id="camera-journey"
        className="camera-track-section"
        aria-label="3D Cinematic Storyboard Showcase"
      >
        <div className="camera-viewport">
          {/* Dynamic Ambient Glow Backdrop that shifts as stories advance */}
          <div
            className="camera-ambient-glow"
            style={{
              transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`
            }}
          />

          {/* Film Grain & Cinematic Atmosphere Overlay */}
          <div className="camera-film-atmosphere" aria-hidden="true" />

          {/* Top HUD Status & Chapter Header */}
          <div className="camera-hud-header" aria-hidden="true">
            <div className="hud-badge">
              <Film size={13} className="hud-badge-icon" />
              <span>CHAPTER II // SELECTED LOVE STORIES</span>
            </div>
            <div className="hud-scene-counter">
              <span>STORY // <strong>{featuredStories[activeStoryIdx]?.title}</strong></span>
            </div>
          </div>

          {/* Scene 2 Multi-Plane Parallax: Foreground Floating Golden Bokeh */}
          <div
            className="camera-foreground-bokeh"
            style={{
              transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24 - scrollProgress * 120}px, 0)`
            }}
            aria-hidden="true"
          >
            <span className="journey-bokeh-orb orb-a" />
            <span className="journey-bokeh-orb orb-b" />
            <span className="journey-bokeh-orb orb-c" />
            <span className="journey-bokeh-orb orb-d" />
          </div>

          {/* 3D World Stage */}
          <div className="camera-world">
            {featuredStories.map((story, i) => {
              // storyOffset: 0 when this story is active center, < 0 when coming from distance, > 0 when passed
              const storyOffset = scrollProgress * (totalStories - 1) - i;

              // Only render if reasonably close to viewport (within -2 to +2 range)
              const isVisible = Math.abs(storyOffset) < 1.8;
              if (!isVisible) return null;

              // Smooth 3D trajectory calculations
              // Main Card: Center swoop with curved X-drift and Z-depth
              const mainZ = -Math.abs(storyOffset) * 750 + (storyOffset > 0 ? storyOffset * 350 : 0);
              const mainX = storyOffset * -780 + mousePos.x * 22;
              const mainY = Math.sin(storyOffset * Math.PI) * -45 + mousePos.y * 16;
              const mainRotY = storyOffset * 24 + mousePos.x * 6;
              const mainRotX = -storyOffset * 6 - mousePos.y * 5;
              const mainScale = Math.max(0.72, 1 - Math.abs(storyOffset) * 0.28);
              const mainOpacity = Math.max(0, 1 - Math.pow(Math.abs(storyOffset), 1.6));
              const mainBlur = Math.min(10, Math.abs(storyOffset) * 7);

              // Companion Photo 1 (Left floating polaroid): Moves with dynamic parallax
              const comp1X = -430 + storyOffset * -620 + mousePos.x * 12;
              const comp1Y = -25 + storyOffset * 80 + mousePos.y * 10;
              const comp1Z = 120 - Math.abs(storyOffset) * 900;
              const comp1RotY = 14 + storyOffset * 18;
              const comp1RotZ = -4 + storyOffset * 8;
              const comp1Opacity = Math.max(0, 1 - Math.abs(storyOffset) * 1.3);

              // Companion Photo 2 (Right floating frame): Offsets opposite side
              const comp2X = 440 + storyOffset * -650 + mousePos.x * 14;
              const comp2Y = 60 - storyOffset * 70 + mousePos.y * 12;
              const comp2Z = -100 - Math.abs(storyOffset) * 950;
              const comp2RotY = -16 + storyOffset * 15;
              const comp2RotZ = 6 - storyOffset * 6;
              const comp2Opacity = Math.max(0, 1 - Math.abs(storyOffset) * 1.4);

              // Watermark Background Numeral: Deep in the Z-plane
              const bgNumZ = -400 - Math.abs(storyOffset) * 600;
              const bgNumX = storyOffset * -400;

              // Extract authentic secondary images for companion frames
              const companionImg1 = story.images[1]?.url || story.heroImage;
              const companionImg2 = story.images[2]?.url || story.coverImage;

              return (
                <div
                  key={story.id}
                  className="storyboard-cluster"
                  style={{
                    opacity: mainOpacity,
                    pointerEvents: Math.abs(storyOffset) < 0.45 ? 'auto' : 'none'
                  }}
                  aria-hidden={Math.abs(storyOffset) >= 0.5}
                >
                  {/* Floating Giant Chapter Watermark in Background */}
                  <div
                    className="storyboard-bg-watermark"
                    style={{
                      transform: `translate3d(calc(-50% + ${bgNumX}px), -50%, ${bgNumZ}px)`,
                      opacity: Math.max(0, 0.08 - Math.abs(storyOffset) * 0.06)
                    }}
                  >
                    0{i + 1}
                  </div>

                  {/* Left Companion Polaroid Frame */}
                  <div
                    className="companion-print companion-left"
                    style={{
                      transform: `translate3d(calc(-50% + ${comp1X}px), calc(-50% + ${comp1Y}px), ${comp1Z}px) rotateY(${comp1RotY}deg) rotateZ(${comp1RotZ}deg)`,
                      opacity: comp1Opacity,
                      filter: `blur(${mainBlur * 0.7}px)`
                    }}
                    onClick={() => onSelectStory(story)}
                  >
                    <div className="polaroid-inner">
                      <img
                        src={companionImg1}
                        alt={`${story.title} candid detail`}
                        className="polaroid-photo"
                        loading="lazy"
                      />
                      <span className="polaroid-caption">Ceremony Moments</span>
                    </div>
                  </div>

                  {/* Right Companion Fine-Art Frame */}
                  <div
                    className="companion-print companion-right"
                    style={{
                      transform: `translate3d(calc(-50% + ${comp2X}px), calc(-50% + ${comp2Y}px), ${comp2Z}px) rotateY(${comp2RotY}deg) rotateZ(${comp2RotZ}deg)`,
                      opacity: comp2Opacity,
                      filter: `blur(${mainBlur * 0.7}px)`
                    }}
                    onClick={() => onSelectStory(story)}
                  >
                    <div className="fineart-inner">
                      <img
                        src={companionImg2}
                        alt={`${story.title} portrait vignette`}
                        className="fineart-photo"
                        loading="lazy"
                      />
                      <div className="fineart-tag">
                        <Sparkles size={11} /> Handcrafted
                      </div>
                    </div>
                  </div>

                  {/* Centerpiece Hero Storyboard Card */}
                  <div
                    className="story-main-card specular-card"
                    style={{
                      transform: `translate3d(calc(-50% + ${mainX}px), calc(-50% + ${mainY}px), ${mainZ}px) rotateY(${mainRotY}deg) rotateX(${mainRotX}deg) scale(${mainScale})`,
                      filter: `blur(${mainBlur}px)`
                    }}
                    tabIndex={Math.abs(storyOffset) < 0.45 ? 0 : -1}
                    role="region"
                    aria-label={`${story.title} wedding chronicle`}
                  >
                    {/* Glowing Edge Light Border */}
                    <div className="card-ambient-glow" />

                    <div className="card-media-wrapper">
                      <img
                        src={story.videoPoster || story.coverImage}
                        alt={story.title}
                        className="card-media-img"
                        loading={i < 2 ? 'eager' : 'lazy'}
                      />
                      <div className="card-vignette-overlay" />
                    </div>

                    {/* Top Meta Bar */}
                    <div className="card-top-bar">
                      <span className="card-category-pill">
                        {story.category}
                      </span>
                      {story.videoUrl && (
                        <span className="card-film-badge">
                          <Film size={12} /> 4K Film
                        </span>
                      )}
                    </div>

                    {/* Bottom Editorial Content */}
                    <div className="card-editorial-content">
                      <div className="card-eyebrow">
                        <span>Chronicle 0{i + 1}</span>
                        <span className="card-eyebrow-bullet">•</span>
                        <span>{story.imageCount} Curated Photographs</span>
                      </div>

                      <h2 className="card-couple-title">
                        {story.title}
                      </h2>

                      <p className="card-story-tagline">
                        {story.tagline}
                      </p>

                      {/* Interactive Action Bar */}
                      <div className="card-actions-bar">
                        <button
                          type="button"
                          className="btn-story-explore"
                          onClick={() => onSelectStory(story)}
                          aria-label={`Explore full story gallery of ${story.title}`}
                        >
                          <ImageIcon size={15} />
                          <span>Explore Story Gallery</span>
                          <ChevronRight size={14} />
                        </button>

                        {story.videoUrl && (
                          <button
                            type="button"
                            className="btn-story-play-film"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayFilm(story);
                            }}
                            aria-label={`Watch ${story.title} cinematic wedding film`}
                          >
                            <span className="play-icon-ring">
                              <Play size={13} fill="currentColor" />
                            </span>
                            <span>Watch Film</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Interactive Storyboard Timeline Navigator */}
          <nav
            className="storyboard-timeline-nav"
            aria-label="Storyboard Story Navigation"
          >
            <div className="timeline-items-wrapper">
              {featuredStories.map((story, idx) => {
                const isActive = activeStoryIdx === idx;
                return (
                  <button
                    key={story.id}
                    type="button"
                    className={`timeline-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => jumpToStory(idx)}
                    aria-label={`Jump to chronicle 0${idx + 1}: ${story.title}`}
                  >
                    <span className="timeline-nav-index">0{idx + 1}</span>
                    <span className="timeline-nav-name">{story.title.replace('&amp;', '&')}</span>
                    <span className="timeline-nav-pill" />
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
};

