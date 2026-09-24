import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, ArrowRight, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory, WeddingImage } from '../data/couplesData';
import { VideoModal } from '../components/VideoModal';
import { galleryStorage } from '../utils/galleryStorage';
import { handleImageError } from '../utils/imageFallback';
import { businessInfo } from '../data/businessData';
import './PortfolioPage.css';

interface PortfolioPageProps {
  onSelectStory: (story: WeddingStory) => void;
}

interface LightboxState {
  images: WeddingImage[];
  index: number;
  storyTitle: string;
}

interface PhotoCollection {
  id: string;
  tagline: string;
  category: string;
  frameCount: number;
  coverImage: string;
  storyTitle: string;
  story: WeddingStory;
}

interface CinemaFilm {
  id: string;
  title: string;
  year: string;
  location: string;
  poster: string;
  videoUrl: string;
}

interface BehindTheLensReel {
  id: string;
  number: string;
  title: string;
  poster: string;
  videoUrl: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Stories' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'pre-wedding', label: 'Pre Wedding' },
  { id: 'bengali', label: 'Bengali Wedding' },
  { id: 'destination', label: 'Destination' },
  { id: 'traditional', label: 'Traditional' }
];

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onSelectStory }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allStories, setAllStories] = useState<WeddingStory[]>(couplesData);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string; poster?: string; title: string } | null>(null);
  const [activeCollection, setActiveCollection] = useState<PhotoCollection | null>(null);
  const [headerRevealed, setHeaderRevealed] = useState(false);
  const [wallExpanded, setWallExpanded] = useState(false);
  const reelTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setHeaderRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let isMounted = true;
    galleryStorage.getUnifiedStories().then(stories => {
      if (isMounted && stories && stories.length > 0) setAllStories(stories);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Filter stories based on selected category pill
  const filteredStories = allStories.filter(story => {
    if (selectedCategory === 'all') return true;
    const cat = story.category.toLowerCase();
    if (selectedCategory === 'wedding') return cat.includes('wedding') && !cat.includes('pre');
    if (selectedCategory === 'pre-wedding') return cat.includes('pre') || cat.includes('destination');
    if (selectedCategory === 'bengali') return cat.includes('bengali');
    if (selectedCategory === 'destination') return cat.includes('destination');
    if (selectedCategory === 'traditional') return cat.includes('traditional');
    return true;
  });

  // Prepare Curated Collections for "OUR PHOTOS"
  const collections: PhotoCollection[] = [
    {
      id: 'col-wedding',
      tagline: 'The Big Day',
      category: 'WEDDING',
      frameCount: allStories[1]?.imageCount || 32,
      coverImage: allStories[1]?.coverImage || '/assets/posters/paraj_mrinmoyee.jpg',
      storyTitle: allStories[1]?.title || 'Paraj & Mrinmoyee',
      story: allStories[1] || allStories[0]
    },
    {
      id: 'col-pre-wedding',
      tagline: 'Before The Vows',
      category: 'PRE WEDDING',
      frameCount: allStories[5]?.imageCount || 20,
      coverImage: allStories[5]?.coverImage || '/assets/portfolio/default_wedding_photo.jpg',
      storyTitle: allStories[5]?.title || 'Arnab & Shirsha',
      story: allStories[5] || allStories[0]
    },
    {
      id: 'col-bengali',
      tagline: 'Heritage Roots',
      category: 'BENGALI WEDDING',
      frameCount: allStories[2]?.imageCount || 28,
      coverImage: allStories[2]?.coverImage || '/assets/posters/ankita_subhadeep.jpg',
      storyTitle: allStories[2]?.title || 'Ankita & Subhadeep',
      story: allStories[2] || allStories[0]
    },
    {
      id: 'col-traditional',
      tagline: 'Sacred Mandap',
      category: 'TRADITIONAL WEDDING',
      frameCount: allStories[3]?.imageCount || 24,
      coverImage: allStories[3]?.coverImage || '/assets/posters/avik_binita.jpg',
      storyTitle: allStories[3]?.title || 'Avik & Binita',
      story: allStories[3] || allStories[0]
    },
    {
      id: 'col-destination',
      tagline: 'Intimate Symphony',
      category: 'DESTINATION WEDDING',
      frameCount: allStories[0]?.imageCount || 26,
      coverImage: allStories[0]?.coverImage || '/assets/posters/urmi_jasraj.jpg',
      storyTitle: allStories[0]?.title || 'Jasraj & Urmi',
      story: allStories[0]
    },
    {
      id: 'col-candid',
      tagline: 'Twilight Horizon',
      category: 'CANDID & DOCUMENTARY',
      frameCount: allStories[4]?.imageCount || 22,
      coverImage: allStories[4]?.coverImage || '/assets/posters/suchi_hira.jpg',
      storyTitle: allStories[4]?.title || 'Suchi & Hira',
      story: allStories[4] || allStories[0]
    }
  ];

  // Curated Films for "OUR FILMS"
  const weddingFilms: CinemaFilm[] = [
    {
      id: 'wf-1',
      title: 'PARAJ & MRINMOYEE',
      year: '2025',
      location: 'AGARTALA',
      poster: '/assets/posters/paraj_mrinmoyee.jpg',
      videoUrl: '/assets/videos/paraj_mrinmoyee.mp4'
    },
    {
      id: 'wf-2',
      title: 'ANKITA & SUBHADEEP',
      year: '2024',
      location: 'BENGAL',
      poster: '/assets/posters/ankita_subhadeep.jpg',
      videoUrl: '/assets/videos/ankita_subhadeep.mp4'
    },
    {
      id: 'wf-3',
      title: 'AVIK & BINITA',
      year: '2025',
      location: 'HERITAGE MANDAP',
      poster: '/assets/posters/avik_binita.jpg',
      videoUrl: '/assets/videos/avik_binita.mp4'
    }
  ];

  const preWeddingFilms: CinemaFilm[] = [
    {
      id: 'pw-1',
      title: 'JASRAJ & URMI',
      year: '2025',
      location: 'DESTINATION GALA',
      poster: '/assets/posters/urmi_jasraj.jpg',
      videoUrl: '/assets/videos/urmi_jasraj.mp4'
    },
    {
      id: 'pw-2',
      title: 'SUCHI & HIRA',
      year: '2024',
      location: 'MOUNTAIN TWILIGHT',
      poster: '/assets/posters/suchi_hira.jpg',
      videoUrl: '/assets/videos/suchi_hira.mp4'
    },
    {
      id: 'pw-3',
      title: 'ARNAB & SHIRSHA',
      year: '2025',
      location: 'PRE-WEDDING ATELIER',
      poster: '/assets/portfolio/default_wedding_photo.jpg',
      videoUrl: '/assets/videos/portfolio_bg.mp4'
    }
  ];

  // Behind the Lens Reels for "REEL 03 · OFF CAMERA"
  const behindTheLensReels: BehindTheLensReel[] = [
    {
      id: 'reel-1',
      number: '01',
      title: 'DIRECTING THE CHAOS',
      poster: '/assets/team/brinta_deb.jpg',
      videoUrl: '/assets/videos/paraj_mrinmoyee.mp4'
    },
    {
      id: 'reel-2',
      number: '02',
      title: 'GOLDEN HOUR RUN',
      poster: '/assets/posters/suchi_hira.jpg',
      videoUrl: '/assets/videos/suchi_hira.mp4'
    },
    {
      id: 'reel-3',
      number: '03',
      title: 'BETWEEN TAKES',
      poster: '/assets/team/anirban_roy.jpg',
      videoUrl: '/assets/videos/ankita_subhadeep.mp4'
    },
    {
      id: 'reel-4',
      number: '04',
      title: 'CANDID SMILES',
      poster: '/assets/team/sayan_mukherjee.jpg',
      videoUrl: '/assets/videos/avik_binita.mp4'
    },
    {
      id: 'reel-5',
      number: '05',
      title: 'DRONE PERSPECTIVE',
      poster: '/assets/portfolio/default_wedding_photo.jpg',
      videoUrl: '/assets/videos/portfolio_bg.mp4'
    },
    {
      id: 'reel-6',
      number: '06',
      title: 'CELEBRATION GLOW',
      poster: '/assets/posters/urmi_jasraj.jpg',
      videoUrl: '/assets/videos/urmi_jasraj.mp4'
    }
  ];

  // Build all wall images for Wall of Moments
  const wallImages: Array<{ url: string; alt: string; storyTitle: string; story: WeddingStory }> = [];
  for (const story of filteredStories) {
    for (const img of story.images.slice(0, 4)) {
      wallImages.push({ url: img.url, alt: img.alt, storyTitle: story.title, story });
    }
  }
  const displayedWallImages = wallExpanded ? wallImages : wallImages.slice(0, 12);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox && !activeCollection) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) closeLightbox();
        else if (activeCollection) setActiveCollection(null);
      }
      if (lightbox) {
        if (e.key === 'ArrowRight') setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : null);
        if (e.key === 'ArrowLeft') setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : null);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, activeCollection, closeLightbox]);

  const openLightbox = (story: WeddingStory, imgIdx = 0) => {
    setLightbox({ images: story.images, index: imgIdx, storyTitle: story.title });
  };

  const scrollReelTrack = (direction: 'left' | 'right') => {
    if (!reelTrackRef.current) return;
    const amount = direction === 'left' ? -340 : 340;
    reelTrackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <main className="gm-portfolio-page" id="main-content">

      {/* ── 1. Hero Header ──────────────────────────── */}
      <section className="gm-gallery-hero">
        <div className="gm-hero-inner">
          <p className="gm-hero-eyebrow">
            <span className="gm-eyebrow-line" aria-hidden="true" />
            THE WALL OF MOMENTS
            <span className="gm-eyebrow-line" aria-hidden="true" />
          </p>

          <h1 className="gm-gallery-title" aria-label="Our gallery">
            <span className="gm-gallery-prefix">Our</span>
            <span className="gm-title-letters-wrap">
              {'GALLERY'.split('').map((ch, i) => (
                <span
                  key={i}
                  className={`gm-title-letter ${headerRevealed ? 'revealed' : ''} ${i % 2 === 1 ? 'outline-letter' : ''}`}
                  style={{ transitionDelay: `${0.06 + 0.06 * i}s` }}
                  aria-hidden="true"
                >
                  {ch}
                </span>
              ))}
            </span>
          </h1>

          <p className="gm-hero-subtitle">
            Timeless stories captured through our lens — every frame below made it to the wall.
          </p>

          {/* Filter Pills */}
          <div className="gm-hero-pills" role="tablist" aria-label="Filter stories by theme">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={`gm-hero-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. GALLERY 01 · EXPLORE — OUR PHOTOS ─────── */}
      <section className="gm-photos-section" id="photos">
        <div className="gm-container">
          <div className="gm-section-header">
            <p className="gm-section-eyebrow">GALLERY 01 · EXPLORE</p>
            <h2 className="gm-section-display-title">OUR PHOTOS</h2>
            <p className="gm-section-subtitle">
              Four chapters of every love story. Pick one to wander through its collage — then tap any frame to see it up close.
            </p>
          </div>

          {/* Curated Photo Portrait Collections Grid */}
          <div className="gm-collections-grid">
            {collections.map(col => (
              <div key={col.id} className="gm-collection-col">
                <button
                  type="button"
                  aria-label={`View ${col.category} collection`}
                  className="gm-collection-card group"
                  onClick={() => setActiveCollection(col)}
                >
                  <div className="gm-collection-media">
                    <img
                      src={col.coverImage}
                      alt={col.storyTitle}
                      className="gm-collection-img"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <div className="gm-collection-overlay" />
                    
                    {/* Viewfinder corner pips */}
                    <span className="corner-pip corner-tl" aria-hidden="true" />
                    <span className="corner-pip corner-tr" aria-hidden="true" />
                    <span className="corner-pip corner-bl" aria-hidden="true" />
                    <span className="corner-pip corner-br" aria-hidden="true" />

                    <div className="gm-collection-badge-wrap">
                      <span className="gm-collection-tagline">{col.tagline}</span>
                      <h3 className="gm-collection-name">{col.category}</h3>
                      <span className="gm-collection-count">{col.frameCount} FRAMES</span>
                    </div>

                    <div className="gm-collection-hover-pill">
                      <span>Explore Chapter</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Wander Through Every Moment Button */}
          <div className="gm-wander-row">
            <button
              type="button"
              className="gm-wander-btn"
              onClick={() => setWallExpanded(v => !v)}
            >
              <span>{wallExpanded ? 'Show Curated Highlights' : 'Wander Through Every Moment'}</span>
              <ArrowRight
                size={15}
                style={{ transform: wallExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }}
              />
            </button>
          </div>

          {/* Wall of Moments Collage */}
          {wallExpanded && (
            <div className="gm-wall-reveal-wrap">
              <div className="gm-wall-header-sm">
                <p className="gm-wall-eyebrow-sm">ARCHIVAL WALL</p>
                <h3 className="gm-wall-heading-sm">Every Captured Chronicle</h3>
              </div>
              <div className="gm-wall-grid">
                {displayedWallImages.map((img, i) => (
                  <button
                    key={`${img.url}-${i}`}
                    type="button"
                    className="gm-wall-cell"
                    onClick={() => openLightbox(img.story, Math.max(0, img.story.images.findIndex(si => si.url === img.url)))}
                    aria-label={`View photo from ${img.storyTitle}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="gm-wall-img"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <div className="gm-wall-hover">
                      <span className="gm-wall-story-name">{img.storyTitle}</span>
                      <span className="gm-wall-view-label"><Eye size={12} /> View</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. REEL 02 · PRESS PLAY — OUR FILMS ───────── */}
      <section className="gm-films-section" id="films">
        <div className="gm-container">
          <div className="gm-section-header">
            <p className="gm-section-eyebrow">REEL 02 · PRESS PLAY</p>
            <h2 className="gm-section-display-title">OUR FILMS</h2>
            <p className="gm-section-subtitle">
              Love stories in motion — tap any film to watch the cinema reel.
            </p>
          </div>

          {/* Sub-row 1: WEDDING FILMS */}
          <div className="gm-film-category-block">
            <div className="gm-film-row-header">
              <h3 className="gm-film-category-title">WEDDING FILMS</h3>
              <a
                href={businessInfo.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="gm-film-view-all-pill"
                aria-label="View all wedding films on YouTube"
              >
                VIEW ALL <ArrowRight size={12} />
              </a>
            </div>

            <div className="gm-cinema-grid">
              {weddingFilms.map(film => (
                <button
                  key={film.id}
                  type="button"
                  className="gm-cinema-card"
                  onClick={() => setActiveVideo({ url: film.videoUrl, poster: film.poster, title: film.title })}
                  aria-label={`Play film: ${film.title}`}
                >
                  <div className="gm-cinema-media-wrap">
                    <img
                      src={film.poster}
                      alt={film.title}
                      className="gm-cinema-poster"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <div className="gm-cinema-gradient" />
                    
                    {/* Viewfinder corner pips */}
                    <span className="corner-pip corner-tl" aria-hidden="true" />
                    <span className="corner-pip corner-tr" aria-hidden="true" />
                    <span className="corner-pip corner-bl" aria-hidden="true" />
                    <span className="corner-pip corner-br" aria-hidden="true" />

                    {/* Glowing Cinema Play Button */}
                    <div className="gm-cinema-play-hub">
                      <div className="gm-play-circle">
                        <Play size={20} fill="currentColor" className="gm-play-icon" />
                        <span className="gm-play-pulse" aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  <div className="gm-cinema-meta">
                    <span className="gm-cinema-chip">{film.year} &middot; {film.location}</span>
                    <h4 className="gm-cinema-couple">{film.title}</h4>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-row 2: PRE WEDDING & CELEBRATION FILMS */}
          <div className="gm-film-category-block">
            <div className="gm-film-row-header">
              <h3 className="gm-film-category-title">PRE WEDDING FILMS</h3>
              <a
                href={businessInfo.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="gm-film-view-all-pill"
                aria-label="View all pre-wedding films on YouTube"
              >
                VIEW ALL <ArrowRight size={12} />
              </a>
            </div>

            <div className="gm-cinema-grid">
              {preWeddingFilms.map(film => (
                <button
                  key={film.id}
                  type="button"
                  className="gm-cinema-card"
                  onClick={() => setActiveVideo({ url: film.videoUrl, poster: film.poster, title: film.title })}
                  aria-label={`Play film: ${film.title}`}
                >
                  <div className="gm-cinema-media-wrap">
                    <img
                      src={film.poster}
                      alt={film.title}
                      className="gm-cinema-poster"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <div className="gm-cinema-gradient" />
                    
                    {/* Viewfinder corner pips */}
                    <span className="corner-pip corner-tl" aria-hidden="true" />
                    <span className="corner-pip corner-tr" aria-hidden="true" />
                    <span className="corner-pip corner-bl" aria-hidden="true" />
                    <span className="corner-pip corner-br" aria-hidden="true" />

                    {/* Glowing Cinema Play Button */}
                    <div className="gm-cinema-play-hub">
                      <div className="gm-play-circle">
                        <Play size={20} fill="currentColor" className="gm-play-icon" />
                        <span className="gm-play-pulse" aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  <div className="gm-cinema-meta">
                    <span className="gm-cinema-chip">{film.year} &middot; {film.location}</span>
                    <h4 className="gm-cinema-couple">{film.title}</h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. REEL 03 · OFF CAMERA — BEHIND THE LENS ── */}
      <section className="gm-behind-lens-section" id="behind-the-lens">
        <div className="gm-container">
          <div className="gm-section-header">
            <p className="gm-section-eyebrow">REEL 03 · OFF CAMERA</p>
            <h2 className="gm-section-display-title">BEHIND THE LENS</h2>
            <p className="gm-section-subtitle">
              The frames you never see — our crew at work, straight from the gram.
            </p>
          </div>

          <div className="gm-reel-carousel-container">
            {/* Scroll Navigation Arrows */}
            <button
              type="button"
              className="gm-carousel-arrow left"
              onClick={() => scrollReelTrack('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="gm-carousel-arrow right"
              onClick={() => scrollReelTrack('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={22} />
            </button>

            {/* Horizontal Track of 9:16 Vertical Reels */}
            <div className="gm-reel-track" ref={reelTrackRef}>
              {behindTheLensReels.map((reel) => (
                <button
                  key={reel.id}
                  type="button"
                  className="gm-reel-vertical-card"
                  onClick={() => setActiveVideo({ url: reel.videoUrl, poster: reel.poster, title: `Behind The Lens — ${reel.title}` })}
                  aria-label={`Play Behind The Lens Reel ${reel.number}: ${reel.title}`}
                >
                  <div className="gm-reel-media">
                    <img
                      src={reel.poster}
                      alt={reel.title}
                      className="gm-reel-poster"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <div className="gm-reel-overlay" />

                    {/* Corner pips */}
                    <span className="corner-pip corner-tl" aria-hidden="true" />
                    <span className="corner-pip corner-tr" aria-hidden="true" />
                    <span className="corner-pip corner-bl" aria-hidden="true" />
                    <span className="corner-pip corner-br" aria-hidden="true" />

                    {/* Play Badge */}
                    <div className="gm-reel-play-btn">
                      <Play size={18} fill="currentColor" />
                    </div>

                    {/* Bottom Metadata */}
                    <div className="gm-reel-meta">
                      <span className="gm-reel-number">{reel.number}</span>
                      <h4 className="gm-reel-title">{reel.title}</h4>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA Banner: YOUR STORY BELONGS HERE ────── */}
      <section className="gm-cta-banner">
        <div className="gm-cta-inner">
          <p className="gm-cta-label">Your turn</p>
          <h2 className="gm-cta-heading">YOUR STORY BELONGS HERE</h2>
          <div className="gm-cta-actions">
            <a
              href={businessInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gm-cta-btn-primary"
            >
              BOOK YOUR DATE <ArrowRight size={15} />
            </a>
            <a
              href="/#packages"
              className="gm-cta-btn-secondary"
            >
              VIEW PACKAGES
            </a>
          </div>
        </div>
      </section>

      {/* ── Interactive Collection Collage Modal ────── */}
      {activeCollection && (
        <div
          className="gm-collection-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeCollection.category} Collection Collage`}
          onClick={e => { if (e.target === e.currentTarget) setActiveCollection(null); }}
        >
          <div className="gm-collection-modal-inner">
            <header className="gm-collection-modal-header">
              <div className="gm-modal-title-group">
                <span className="gm-modal-eyebrow">{activeCollection.tagline}</span>
                <h3 className="gm-modal-heading">{activeCollection.category}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <span className="gm-modal-count">{activeCollection.story.images.length} Archival Frames</span>
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--gm-wine, #8A1212)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => onSelectStory(activeCollection.story)}
                  >
                    View Story Chronicle <ArrowRight size={12} />
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="gm-collection-modal-close"
                onClick={() => setActiveCollection(null)}
                aria-label="Close collage"
              >
                <X size={22} />
              </button>
            </header>

            <div className="gm-collection-modal-collage">
              {activeCollection.story.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  className="gm-collage-item"
                  onClick={() => openLightbox(activeCollection.story, idx)}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `${activeCollection.storyTitle} frame`}
                    className="gm-collage-img"
                    loading="lazy"
                    onError={handleImageError}
                  />
                  <div className="gm-collage-item-overlay">
                    <span className="gm-collage-item-idx">Frame {String(idx + 1).padStart(2, '0')}</span>
                    <span className="gm-collage-zoom-icon"><Eye size={14} /> Enlarge</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox Modal ─────────────────────────── */}
      {lightbox && (
        <div
          className="gm-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery lightbox: ${lightbox.storyTitle}`}
          onClick={e => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          <button type="button" className="gm-lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
            <X size={22} />
          </button>

          <div className="gm-lightbox-content">
            <img
              key={lightbox.index}
              src={lightbox.images[lightbox.index]?.url}
              alt={lightbox.images[lightbox.index]?.alt}
              className="gm-lightbox-img"
              onError={handleImageError}
            />
          </div>

          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                className="gm-lightbox-nav gm-lb-prev"
                onClick={() => setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : null)}
                aria-label="Previous image"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                className="gm-lightbox-nav gm-lb-next"
                onClick={() => setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : null)}
                aria-label="Next image"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          <div className="gm-lightbox-meta">
            <span className="gm-lb-title">{lightbox.storyTitle}</span>
            <span className="gm-lb-count">{lightbox.index + 1} / {lightbox.images.length}</span>
          </div>
        </div>
      )}

      {/* ── Cinema Video Modal ──────────────────────── */}
      {activeVideo && (
        <VideoModal
          isOpen={true}
          videoUrl={activeVideo.url}
          posterUrl={activeVideo.poster}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </main>
  );
};
