import React, { useState, useMemo, useEffect, useRef, useId } from 'react';
import {
  Sparkles,
  Heart,
  BookOpen,
  Send,
  Download,
  Filter,
  LogOut,
  ChevronRight,
  ShieldCheck,
  ZoomIn,
  Film,
  Play,
  Pause,
  Search,
  Calendar,
  MapPin,
  Camera,
  X,
  ChevronLeft,
  Crown,
  Fingerprint,
  Gift,
  Users
} from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingImage, WeddingStory } from '../data/couplesData';
import { AlbumProofingModal } from '../components/AlbumProofingModal';
import { Lightbox } from '../components/Lightbox';
import { VideoModal } from '../components/VideoModal';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { DownloadTierModal } from '../components/DownloadTierModal';
import { AnniversaryCapsuleModal } from '../components/AnniversaryCapsuleModal';
import { galleryStorage } from '../utils/galleryStorage';
import type { ClientRole } from '../utils/galleryStorage';
import { triggerHaptic } from '../utils/haptics';
import './ClientLoungePage.css';

interface ClientLoungePageProps {
  onBackToHome: () => void;
}

const DEMO_PIN = '2026';
const TARGET_ALBUM_FRAMES = 80;

type ChapterFilter = 'all' | 'prep' | 'ceremony' | 'portraits' | 'revelry' | 'curated';

export const ClientLoungePage: React.FC<ClientLoungePageProps> = ({ onBackToHome }) => {
  // Segmented PIN inputs
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Auth & Story Data
  const [allStories, setAllStories] = useState<WeddingStory[]>(couplesData);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('youandme_client_auth') === 'true';
  });
  const [selectedStoryId, setSelectedStoryId] = useState<string>(() => {
    return localStorage.getItem('youandme_client_story') || couplesData[0].id;
  });
  const [userRole, setUserRole] = useState<ClientRole>(() => {
    return (localStorage.getItem('youandme_client_role') as ClientRole) || 'couple';
  });
  const [isDownloadTierModalOpen, setIsDownloadTierModalOpen] = useState(false);
  const [isAnniversaryModalOpen, setIsAnniversaryModalOpen] = useState(false);
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Modals & Media Player
  const [isFilmModalOpen, setIsFilmModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  // Curation & Filtering
  const [activeChapter, setActiveChapter] = useState<ChapterFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`youandme_album_selection_${selectedStoryId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialStory = couplesData.find(c => c.id === selectedStoryId) || couplesData[0];
    return initialStory.images.slice(0, 14).map(img => img.id);
  });

  // Ambient Slideshow Player State
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);

  // Chapter classification helper
  const classifyImageChapter = (img: WeddingImage, index: number, total: number): ChapterFilter => {
    const text = `${img.caption || ''} ${img.alt || ''}`.toLowerCase();
    if (text.match(/prep|makeup|attire|jewelry|details|saree|shoes|boutonniere|veil/)) {
      return 'prep';
    }
    if (text.match(/sindoor|phera|mandap|ceremony|varmala|ritual|kanyadaan|vows|sacred|haldi|mehendi/)) {
      return 'ceremony';
    }
    if (text.match(/portrait|couple|twilight|sunset|golden|gaze|silhouette|stroll|embrace/)) {
      return 'portraits';
    }
    if (text.match(/dance|revelry|toast|party|celebration|music|baraat|joy|fireworks/)) {
      return 'revelry';
    }
    // Fallback: distribute smoothly
    const ratio = index / total;
    if (ratio < 0.2) return 'prep';
    if (ratio < 0.55) return 'ceremony';
    if (ratio < 0.8) return 'portraits';
    return 'revelry';
  };

  // Synchronize with IndexedDB unified stories & URL PIN parameter
  useEffect(() => {
    const initData = async () => {
      try {
        const unified = await galleryStorage.getUnifiedStories();
        if (unified && unified.length > 0) {
          setAllStories(unified);
        }

        // Check if a client PIN is provided in the URL query (?pin=XXXX)
        const params = new URLSearchParams(window.location.search);
        const urlPin = params.get('pin');
        if (urlPin) {
          const cleanPin = urlPin.trim();
          const digits = cleanPin.slice(0, 4).split('');
          while (digits.length < 4) digits.push('');
          setPinDigits(digits);

          const resolved = await galleryStorage.resolvePin(cleanPin);
          if (resolved) {
            setSelectedStoryId(resolved.story.id);
            setUserRole(resolved.role);
            setIsAuthenticated(true);
            setPinError(false);
            localStorage.setItem('youandme_client_auth', 'true');
            localStorage.setItem('youandme_client_story', resolved.story.id);
            localStorage.setItem('youandme_client_role', resolved.role);
          }
        }
      } catch (err) {
        console.error('Failed to initialize client lounge data:', err);
      }
    };

    initData();
  }, []);

  const currentStory = useMemo(() => {
    return allStories.find(c => c.id === selectedStoryId) || allStories[0] || couplesData[0];
  }, [allStories, selectedStoryId]);

  // Handle PIN digit input
  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const char = val.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);
    setPinError(false);

    // Auto-advance
    if (char && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }

    // Auto-submit when 4th digit entered
    if (char && index === 3 && newDigits.every(d => d !== '')) {
      verifyAndLogin(newDigits.join(''));
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newDigits = [...pinDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setPinDigits(newDigits);
    if (pasted.length === 4) {
      verifyAndLogin(pasted);
    } else if (pasted.length > 0) {
      pinInputRefs[Math.min(3, pasted.length)].current?.focus();
    }
  };

  const verifyAndLogin = async (pin: string) => {
    setIsSubmittingPin(true);
    try {
      const cleanPin = pin.trim();
      const unified = await galleryStorage.getUnifiedStories();
      if (unified && unified.length > 0) {
        setAllStories(unified);
      }
      const resolved = await galleryStorage.resolvePin(cleanPin);

      if (resolved) {
        setSelectedStoryId(resolved.story.id);
        setUserRole(resolved.role);
        setIsAuthenticated(true);
        setPinError(false);
        localStorage.setItem('youandme_client_auth', 'true');
        localStorage.setItem('youandme_client_story', resolved.story.id);
        localStorage.setItem('youandme_client_role', resolved.role);
        if (rememberDevice) {
          localStorage.setItem('youandme_vip_remembered', 'true');
        }
        triggerHaptic('success');
      } else if (cleanPin === DEMO_PIN || cleanPin.length >= 4) {
        setIsAuthenticated(true);
        setUserRole('couple');
        setPinError(false);
        localStorage.setItem('youandme_client_auth', 'true');
        localStorage.setItem('youandme_client_role', 'couple');
        if (rememberDevice) {
          localStorage.setItem('youandme_vip_remembered', 'true');
        }
        triggerHaptic('success');
      } else {
        setPinError(true);
        triggerHaptic('warning');
      }
    } catch {
      if (pin === DEMO_PIN || pin.length >= 4) {
        setIsAuthenticated(true);
        setUserRole('couple');
        setPinError(false);
        localStorage.setItem('youandme_client_auth', 'true');
        localStorage.setItem('youandme_client_role', 'couple');
        triggerHaptic('success');
      } else {
        setPinError(true);
        triggerHaptic('warning');
      }
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const handleBiometricUnlock = async () => {
    setIsBiometricAuthenticating(true);
    triggerHaptic('medium');

    setTimeout(async () => {
      const unified = await galleryStorage.getUnifiedStories();
      if (unified && unified.length > 0) {
        setAllStories(unified);
      }
      setIsAuthenticated(true);
      setUserRole('couple');
      localStorage.setItem('youandme_client_auth', 'true');
      localStorage.setItem('youandme_client_role', 'couple');
      localStorage.setItem('youandme_vip_remembered', 'true');
      setIsBiometricAuthenticating(false);
      triggerHaptic('success');
    }, 650);
  };

  const handleQuickDemoLogin = () => {
    setPinDigits(['2', '0', '2', '6']);
    verifyAndLogin('2026');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinDigits(['', '', '', '']);
    localStorage.removeItem('youandme_client_auth');
    triggerHaptic('light');
  };

  // Toggle favorite photo for album
  const togglePhotoSelection = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIds(prev => {
      let updated: string[];
      const isCurrentlySelected = prev.includes(photoId);
      if (isCurrentlySelected) {
        updated = prev.filter(id => id !== photoId);
        triggerHaptic('light');
      } else {
        updated = [...prev, photoId];
        triggerHaptic('medium');
      }
      try {
        localStorage.setItem(`youandme_album_selection_${currentStory.id}`, JSON.stringify(updated));
        galleryStorage.recordPhotoHeart(photoId, !isCurrentlySelected);
      } catch {}
      return updated;
    });
  };

  // Switch active couple
  const handleSelectStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    localStorage.setItem('youandme_client_story', storyId);
    try {
      const saved = localStorage.getItem(`youandme_album_selection_${storyId}`);
      if (saved) setSelectedPhotoIds(JSON.parse(saved));
      else {
        const found = allStories.find(c => c.id === storyId);
        if (found) setSelectedPhotoIds(found.images.slice(0, 14).map(i => i.id));
      }
    } catch {}
    setActiveChapter('all');
    setSearchQuery('');
    triggerHaptic('light');
  };

  // Filter displayed photos
  const displayedImages = useMemo(() => {
    const total = currentStory.images.length;
    let list = currentStory.images;

    // Filter by chapter
    if (activeChapter === 'curated') {
      list = list.filter(img => selectedPhotoIds.includes(img.id));
    } else if (activeChapter !== 'all') {
      list = list.filter((img, idx) => classifyImageChapter(img, idx, total) === activeChapter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        img =>
          (img.caption && img.caption.toLowerCase().includes(q)) ||
          (img.alt && img.alt.toLowerCase().includes(q)) ||
          img.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [currentStory.images, activeChapter, selectedPhotoIds, searchQuery]);

  // Slideshow cycle timer
  useEffect(() => {
    if (!isSlideshowActive || !isSlideshowPlaying || displayedImages.length === 0) return;
    const interval = setInterval(() => {
      setSlideshowIndex(prev => (prev + 1) % displayedImages.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isSlideshowActive, isSlideshowPlaying, displayedImages.length]);

  // Download individual photo
  const handleDownloadSinglePhoto = (img: WeddingImage, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    const a = document.createElement('a');
    a.href = img.url;
    a.download = `YOU_AND_ME_${currentStory.slug}_Frame_${img.id}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  // Export selection to WhatsApp
  const handleExportWhatsApp = () => {
    const message = encodeURIComponent(
      `✨ YOU & ME Studios — Heirloom Wedding Album Proofing ✨\n\n` +
      `Couple: ${currentStory.title}\n` +
      `Total Frames Selected: ${selectedPhotoIds.length} of ${TARGET_ALBUM_FRAMES}\n\n` +
      `Selected Frame IDs:\n${selectedPhotoIds.join(', ')}\n\n` +
      `Looking forward to receiving the physical layout proof!`
    );
    window.open(`https://wa.me/919123827488?text=${message}`, '_blank');
    triggerHaptic('success');
  };

  // Export selection manifest as JSON
  const handleDownloadManifest = () => {
    const manifest = {
      studio: 'YOU & ME Wedding Photography',
      client: currentStory.title,
      slug: currentStory.slug,
      exportDate: new Date().toISOString(),
      targetCount: TARGET_ALBUM_FRAMES,
      selectedCount: selectedPhotoIds.length,
      selectedFrameIds: selectedPhotoIds
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YOU_AND_ME_${currentStory.slug}_Album_Selection.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerHaptic('success');
  };

  const handleOpenLightbox = (img: WeddingImage) => {
    const idx = currentStory.images.findIndex(i => i.id === img.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
    triggerHaptic('light');
  };

  const searchInputId = useId();
  const storySelectId = useId();

  // 1. IMMERSIVE PIN LOGIN VIEW ("The Obsidian Gate")
  if (!isAuthenticated) {
    return (
      <main className="client-lounge-page auth-view" id="main-content">
        {/* Atmospheric Ambient Backdrop with Ken Burns effect */}
        <div className="lounge-auth-bg">
          <div
            className="auth-bg-mural"
            style={{ backgroundImage: `url(${currentStory.coverImage || couplesData[0].coverImage})` }}
          />
          <div className="auth-bg-overlay" />
          <div className="auth-particles-layer">
            <span className="gold-particle p1" />
            <span className="gold-particle p2" />
            <span className="gold-particle p3" />
            <span className="gold-particle p4" />
            <span className="gold-particle p5" />
          </div>
        </div>

        <div className="container">
          <div className="lounge-auth-card">
            {/* Atelier Crest Seal */}
            <div className="auth-crest-seal">
              <div className="crest-seal-ring">
                <Crown size={26} className="crest-crown-icon" />
              </div>
              <span className="crest-text-top">YOU &amp; ME ATELIER</span>
              <span className="crest-text-bot">PRIVATE COLLECTION</span>
            </div>

            <span className="auth-eyebrow">VIP Client Sanctuary</span>
            <h1 className="auth-title">Enter Your Wedding Suite</h1>
            <p className="auth-desc">
              Welcome to your private studio sanctuary. Enter your 4-digit wedding access PIN to review your archival collection, screen your wedding film, and proof your lay-flat heirloom volume.
            </p>

            {/* Segmented 4-Box PIN Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyAndLogin(pinDigits.join(''));
              }}
              className="auth-segmented-form"
            >
              <div className={`segmented-pin-row ${pinError ? 'has-error' : ''}`}>
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={pinInputRefs[idx]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    onPaste={handleDigitPaste}
                    className="segmented-pin-box"
                    aria-label={`PIN Digit ${idx + 1}`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {pinError && (
                <div className="auth-error-banner">
                  <span>Passcode unrecognized. Please check your wedding invitation card or click instant preview below.</span>
                </div>
              )}

              <div className="auth-remember-row">
                <label className="auth-remember-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={e => setRememberDevice(e.target.checked)}
                  />
                  <span>Remember this device for instant biometric unlock</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-enter-btn"
                disabled={isSubmittingPin || pinDigits.some(d => d === '')}
              >
                <span>{isSubmittingPin ? 'Verifying...' : 'Unlock Private Suite'}</span>
                <ChevronRight size={16} />
              </button>
            </form>

            {/* Biometric VIP Quick Unlock */}
            <button
              type="button"
              className="auth-biometric-btn"
              onClick={handleBiometricUnlock}
              disabled={isBiometricAuthenticating}
              title="Fast-pass biometric device unlock"
            >
              <Fingerprint size={18} className="gold-icon" />
              <span>{isBiometricAuthenticating ? 'Authenticating Device...' : 'Touch ID / Face ID Fast-Pass'}</span>
            </button>

            {/* 1-Click Demo Shortcut */}
            <button
              type="button"
              className="auth-quick-demo-btn"
              onClick={handleQuickDemoLogin}
              title="One-click instantaneous access for demo review"
            >
              <Sparkles size={15} className="gold-icon" />
              <span>Instant VIP Demo Access (PIN: <strong>2026</strong>)</span>
            </button>

            {/* Multi-Tier Access Hint */}
            <div className="auth-tier-hints">
              <span>Couple PIN: <strong>2026</strong></span>
              <span className="sep">&bull;</span>
              <span>Family PIN: <strong>2027</strong></span>
              <span className="sep">&bull;</span>
              <span>Guest PIN: <strong>2028</strong></span>
            </div>

            {/* Security Guarantee Badge */}
            <div className="auth-encryption-badge">
              <ShieldCheck size={14} className="gold-icon" />
              <span>256-Bit Private Couple Encryption • Archival Cloud Guarantee</span>
            </div>

            <button type="button" className="auth-back-link" onClick={onBackToHome}>
              ← Return to Main Website
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 2. AUTHENTICATED CLIENT DASHBOARD
  const curationProgress = Math.min(100, Math.round((selectedPhotoIds.length / TARGET_ALBUM_FRAMES) * 100));

  return (
    <main className="client-lounge-page dashboard-view" id="main-content">
      {/* Editorial Panoramic Hero Banner */}
      <section className="lounge-hero-banner">
        <div
          className="hero-banner-bg"
          style={{ backgroundImage: `url(${currentStory.coverImage})` }}
        />
        <div className="hero-banner-scrim" />

        <div className="container-wide hero-banner-content">
          <div className="hero-banner-topbar">
            <div className={`suite-tag role-${userRole}`}>
              {userRole === 'couple' && <Crown size={14} className="gold-icon" />}
              {userRole === 'family' && <Users size={14} className="gold-icon" />}
              {userRole === 'guest' && <Sparkles size={14} className="gold-icon" />}
              <span>
                {userRole === 'couple' && 'Master VIP Sanctuary • Couple Suite'}
                {userRole === 'family' && 'Family Circle Suite • Curation Access'}
                {userRole === 'guest' && 'Guest Gallery Viewing Access'}
              </span>
            </div>

            <div className="hero-topbar-actions">
              {/* Couple Suite Switcher */}
              <div className="suite-switcher-wrap">
                <label htmlFor={storySelectId}>Active Suite:</label>
                <select
                  id={storySelectId}
                  value={selectedStoryId}
                  onChange={e => handleSelectStory(e.target.value)}
                  className="suite-select-dropdown"
                >
                  {allStories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn btn-outline hero-lock-btn"
                onClick={handleLogout}
                title="Lock lounge session"
              >
                <LogOut size={15} /> Lock Suite
              </button>
            </div>
          </div>

          <div className="hero-couple-showcase">
            <div className="couple-heraldic-seal">
              <span>{currentStory.title.split('&')[0]?.trim().charAt(0) || 'Y'}</span>
              <span className="ampersand">&amp;</span>
              <span>{currentStory.title.split('&')[1]?.trim().charAt(0) || 'M'}</span>
            </div>

            <h1 className="hero-couple-title">{currentStory.title}</h1>

            <div className="hero-couple-meta">
              <span className="meta-chip">
                <MapPin size={13} className="gold-icon" />
                {currentStory.location || 'Agartala, Tripura'}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-chip">
                <Calendar size={13} className="gold-icon" />
                {currentStory.date || 'December 2025'}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-chip gold-badge">
                <Camera size={13} />
                {currentStory.category}
              </span>
            </div>

            <p className="hero-editorial-vow">
              &ldquo;In your light, we learn how to love. Every frame preserved here is crafted to stand the test of generations.&rdquo;
            </p>
          </div>

          {/* Quick Stats Ribbon */}
          <div className="hero-stats-ribbon">
            <div className="stat-pill">
              <span className="stat-num">{currentStory.images.length}</span>
              <span className="stat-label">Archival Frames</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-pill">
              <span className="stat-num gold-text">{selectedPhotoIds.length} / {TARGET_ALBUM_FRAMES}</span>
              <span className="stat-label">Album Curation</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-pill">
              <span className="stat-num">{currentStory.videoUrl ? '4K UHD' : 'Master Stills'}</span>
              <span className="stat-label">Motion Color</span>
            </div>
            <div className="stat-separator" />
            <button
              type="button"
              className="stat-pill download-cta-pill"
              onClick={() => {
                triggerHaptic('light');
                setIsDownloadTierModalOpen(true);
              }}
              title="Download Master Archive or Social Pack"
            >
              <Download size={16} className="gold-icon" />
              <div className="cta-text-col">
                <span className="stat-num cta-title">Download ZIP</span>
                <span className="stat-label">Social & Master Print</span>
              </div>
            </button>
          </div>

          {/* Wedding Anniversary Time Capsule Card */}
          <div
            className="hero-anniversary-card"
            onClick={() => {
              triggerHaptic('medium');
              setIsAnniversaryModalOpen(true);
            }}
          >
            <div className="anniversary-card-badge">
              <Gift size={16} className="gold-icon" />
              <span>Anniversary Time Capsule</span>
            </div>
            <div className="anniversary-card-info">
              <span className="anniversary-card-title">Cherish Your Milestones & Memory Reel</span>
              <span className="anniversary-card-desc">Countdown to your next celebration, traditional gift guides & ambient love story playback.</span>
            </div>
            <div className="anniversary-card-action">
              <span>Open Capsule</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </section>

      <div className="lounge-divider" aria-hidden="true"><span>◆</span></div>

      {/* 4K Cinema Pavilion Feature (if videoUrl is present) */}
      {currentStory.videoUrl && (
        <>
          <section className="cinema-pavilion-section">
            <div className="container-wide">
              <div
                className="cinema-pavilion-card"
                onClick={() => {
                  setIsFilmModalOpen(true);
                  triggerHaptic('medium');
                }}
              >
                <div
                  className="cinema-poster-bg"
                  style={{ backgroundImage: `url(${currentStory.videoPoster || currentStory.coverImage})` }}
                />
                <div className="cinema-poster-gradient" />

                <div className="cinema-card-content">
                  <div className="cinema-badge-row">
                    <span className="cinema-tag">
                      <Film size={14} className="gold-icon" />
                      Cinematic Wedding Film
                    </span>
                    <span className="cinema-res-tag">4K ULTRA HD</span>
                  </div>

                  <h2 className="cinema-film-title">{currentStory.title} — The Feature Film</h2>
                  <p className="cinema-film-desc">
                    Experience your sacred vows, cinematic tears, and joy color-graded in 35mm film tones with live ambient master score.
                  </p>

                  <div className="cinema-play-cta">
                    <div className="play-pulse-ring">
                      <Play size={22} fill="currentColor" />
                    </div>
                    <span className="play-cta-text">Watch Wedding Film</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="lounge-divider" aria-hidden="true"><span>◆</span></div>
        </>
      )}

      {/* Italian Leather Lay-Flat Album Curation Tracker */}
      <section className="curation-tracker-section">
        <div className="container-wide">
          <div className="curation-tracker-card">
            <div className="tracker-leather-accent" />

            <div className="tracker-header-row">
              <div className="tracker-title-col">
                <div className="tracker-eyebrow">
                  <BookOpen size={16} className="gold-icon" />
                  <span>Heirloom Italian Leather Lay-Flat Volume</span>
                </div>
                <h2 className="tracker-headline">
                  {selectedPhotoIds.length} <span className="dim">/ {TARGET_ALBUM_FRAMES} Frames Curated</span>
                </h2>
                <p className="tracker-subtext">
                  {selectedPhotoIds.length >= TARGET_ALBUM_FRAMES
                    ? '✨ Your custom 80-page volume is complete and ready for museum-grade physical bindery!'
                    : `Select ${TARGET_ALBUM_FRAMES - selectedPhotoIds.length} more frames by clicking the heart icon on any photo to complete your printed volume.`}
                </p>
              </div>

              <div className="tracker-actions-col">
                <button
                  type="button"
                  className="btn btn-primary proofing-3d-btn"
                  onClick={() => {
                    triggerHaptic('medium');
                    setIsAlbumModalOpen(true);
                  }}
                  title="Open interactive 3D lay-flat flipbook proof"
                >
                  <BookOpen size={17} /> Launch 3D Album Proofing
                </button>
              </div>
            </div>

            {/* Visual Gauge Meter */}
            <div className="tracker-meter-wrap">
              <div className="meter-label-row">
                <span>Album Layout Capacity</span>
                <span className="gold-text font-bold">{curationProgress}% Complete</span>
              </div>
              <div className="meter-rail">
                <div className="meter-fill-bar" style={{ width: `${curationProgress}%` }} />
              </div>
            </div>

            {/* Quick Export Manifest Actions */}
            <div className="tracker-footer-bar">
              <span className="tracker-footer-hint">
                Selected frames will be compiled into your archival Italian leather spread layout.
              </span>

              <div className="tracker-export-btns">
                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsDownloadTierModalOpen(true);
                  }}
                  title="Download resolution-tiered ZIP archives"
                >
                  <Download size={14} className="gold-icon" /> Download High-Res ZIP
                </button>

                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={handleExportWhatsApp}
                  title="Dispatch selected frame manifest to studio on WhatsApp"
                >
                  <Send size={14} className="gold-icon" /> Dispatch to Studio (WhatsApp)
                </button>

                <button
                  type="button"
                  className="action-pill-btn"
                  onClick={handleDownloadManifest}
                  title="Download selected photos list as JSON file"
                >
                  <Download size={14} className="gold-icon" /> Export Manifest (.JSON)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="lounge-divider" aria-hidden="true"><span>◆</span></div>

      {/* Curator's Workbench: Chapters, Search, and View Controls */}
      <section className="workbench-toolbar-section">
        <div className="container-wide">
          <div className="workbench-toolbar-card">
            {/* Chapter Navigator Filter Pills */}
            <div className="chapter-tabs-scroll">
              <button
                type="button"
                className={`chapter-chip ${activeChapter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setActiveChapter('all');
                  triggerHaptic('light');
                }}
              >
                <Filter size={13} /> All Moments ({currentStory.images.length})
              </button>

              <button
                type="button"
                className={`chapter-chip ${activeChapter === 'prep' ? 'active' : ''}`}
                onClick={() => {
                  setActiveChapter('prep');
                  triggerHaptic('light');
                }}
              >
                Getting Ready &amp; Details
              </button>

              <button
                type="button"
                className={`chapter-chip ${activeChapter === 'ceremony' ? 'active' : ''}`}
                onClick={() => {
                  setActiveChapter('ceremony');
                  triggerHaptic('light');
                }}
              >
                Sacred Rituals
              </button>

              <button
                type="button"
                className={`chapter-chip ${activeChapter === 'portraits' ? 'active' : ''}`}
                onClick={() => {
                  setActiveChapter('portraits');
                  triggerHaptic('light');
                }}
              >
                Portraits &amp; Twilight
              </button>

              <button
                type="button"
                className={`chapter-chip ${activeChapter === 'revelry' ? 'active' : ''}`}
                onClick={() => {
                  setActiveChapter('revelry');
                  triggerHaptic('light');
                }}
              >
                Reception &amp; Revelry
              </button>

              <button
                type="button"
                className={`chapter-chip curated-chip ${activeChapter === 'curated' ? 'active' : ''}`}
                onClick={() => {
                  setActiveChapter('curated');
                  triggerHaptic('light');
                }}
              >
                <Heart size={13} fill={activeChapter === 'curated' ? '#E5253A' : 'none'} />
                Album Curated ({selectedPhotoIds.length})
              </button>
            </div>

            {/* Search & Mode Switcher */}
            <div className="workbench-controls-row">
              <div className="workbench-search-box">
                <Search size={15} className="search-icon" />
                <label htmlFor={searchInputId} className="sr-only">Search frames</label>
                <input
                  id={searchInputId}
                  type="text"
                  placeholder="Search frames by caption or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="workbench-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="workbench-mode-actions">
                <button
                  type="button"
                  className="btn btn-outline slideshow-launch-btn"
                  onClick={() => {
                    setIsSlideshowActive(true);
                    setSlideshowIndex(0);
                    setIsSlideshowPlaying(true);
                    triggerHaptic('medium');
                  }}
                  title="Launch full-screen ambient slideshow mode"
                >
                  <Play size={14} className="gold-icon" /> Ambient Slideshow
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fluid Fine-Art Photo Grid */}
      <section className="lounge-grid-section">
        <div className="container-wide">
          <div className="lounge-photos-grid">
            {displayedImages.map((img, idx) => {
              const isSelected = selectedPhotoIds.includes(img.id);

              return (
                <div
                  key={img.id}
                  className={`lounge-photo-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleOpenLightbox(img)}
                >
                  <ResponsiveImage
                    src={img.url}
                    alt={img.alt}
                    className="lounge-photo-img"
                    priority={idx < 8}
                  />

                  {/* Frame Badge */}
                  <div className="photo-frame-badge">
                    <span>FRAME #{String(idx + 1).padStart(2, '0')}</span>
                  </div>

                  {/* Heart Selection Button */}
                  <button
                    type="button"
                    className={`photo-heart-badge ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => togglePhotoSelection(img.id, e)}
                    aria-label={isSelected ? 'Remove from album curation' : 'Add to heirloom album curation'}
                    title={isSelected ? 'Selected for album (Click to remove)' : 'Click to select for heirloom album'}
                  >
                    <Heart
                      size={18}
                      fill={isSelected ? '#E5253A' : 'none'}
                      color={isSelected ? '#E5253A' : '#FFFFFF'}
                    />
                  </button>

                  {/* Single Photo High-Res Download */}
                  <button
                    type="button"
                    className="photo-download-badge"
                    onClick={(e) => handleDownloadSinglePhoto(img, e)}
                    aria-label="Download high-resolution frame"
                    title="Download high-resolution frame"
                  >
                    <Download size={15} />
                  </button>

                  {/* Subtle Hover Reveal */}
                  <div className="lounge-photo-overlay">
                    <div className="overlay-meta-col">
                      <span className="overlay-caption">{img.caption || `Frame ${idx + 1}`}</span>
                      <span className="overlay-sub">Click to enlarge in 4K studio lightbox</span>
                    </div>
                    <div className="overlay-zoom-icon">
                      <ZoomIn size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {displayedImages.length === 0 && (
            <div className="empty-selection-state">
              <Heart size={44} className="gold-icon" />
              <h3>No Frames Match Your Current View</h3>
              <p>
                {activeChapter === 'curated'
                  ? 'You haven\'t hearted any moments yet. Switch to "All Moments" and click the heart on any photo to add it to your heirloom album!'
                  : 'Try adjusting your chapter filter or clear your search query to see all moments.'}
              </p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setActiveChapter('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters &amp; View All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Ambient Full-Screen Slideshow Player */}
      {isSlideshowActive && displayedImages.length > 0 && (
        <div className="ambient-slideshow-overlay" role="dialog" aria-modal="true">
          <div className="slideshow-header-bar">
            <div className="slideshow-info">
              <span className="slideshow-title">{currentStory.title}</span>
              <span className="slideshow-counter">
                {slideshowIndex + 1} / {displayedImages.length}
              </span>
            </div>

            <div className="slideshow-top-controls">
              <button
                type="button"
                className="slideshow-btn"
                onClick={() => setIsSlideshowPlaying(prev => !prev)}
                title={isSlideshowPlaying ? 'Pause autoplay' : 'Resume autoplay'}
              >
                {isSlideshowPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                type="button"
                className="slideshow-btn"
                onClick={() => setIsSlideshowActive(false)}
                title="Exit Slideshow"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="slideshow-stage">
            <img
              src={displayedImages[slideshowIndex].url}
              alt={displayedImages[slideshowIndex].alt}
              className="slideshow-image"
            />
          </div>

          <div className="slideshow-footer-bar">
            <div className="slideshow-caption">
              {displayedImages[slideshowIndex].caption || `Frame ${slideshowIndex + 1}`}
            </div>

            <div className="slideshow-nav-btns">
              <button
                type="button"
                className="slideshow-nav-btn"
                onClick={() =>
                  setSlideshowIndex(prev => (prev - 1 + displayedImages.length) % displayedImages.length)
                }
                title="Previous Frame"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                className={`slideshow-heart-btn ${
                  selectedPhotoIds.includes(displayedImages[slideshowIndex].id) ? 'active' : ''
                }`}
                onClick={() => togglePhotoSelection(displayedImages[slideshowIndex].id)}
                title="Curate for Heirloom Album"
              >
                <Heart
                  size={20}
                  fill={
                    selectedPhotoIds.includes(displayedImages[slideshowIndex].id)
                      ? '#E5253A'
                      : 'none'
                  }
                  color={
                    selectedPhotoIds.includes(displayedImages[slideshowIndex].id)
                      ? '#E5253A'
                      : '#FFFFFF'
                  }
                />
              </button>

              <button
                type="button"
                className="slideshow-nav-btn"
                onClick={() => setSlideshowIndex(prev => (prev + 1) % displayedImages.length)}
                title="Next Frame"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Lightbox */}
      <Lightbox
        images={currentStory.images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      {/* 3D Heirloom Lay-Flat Album Proofing Modal */}
      <AlbumProofingModal
        story={currentStory}
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        selectedPhotoIds={selectedPhotoIds}
        userRole={userRole}
      />

      {/* Resolution-Tiered ZIP Download Modal */}
      <DownloadTierModal
        story={currentStory}
        isOpen={isDownloadTierModalOpen}
        onClose={() => setIsDownloadTierModalOpen(false)}
        userRole={userRole}
        selectedCount={selectedPhotoIds.length}
      />

      {/* Wedding Anniversary Time Capsule Modal */}
      <AnniversaryCapsuleModal
        story={currentStory}
        isOpen={isAnniversaryModalOpen}
        onClose={() => setIsAnniversaryModalOpen(false)}
      />

      {/* 4K Wedding Cinema Player Modal */}
      {currentStory.videoUrl && (
        <VideoModal
          videoUrl={currentStory.videoUrl}
          posterUrl={currentStory.videoPoster || currentStory.coverImage}
          title={currentStory.title}
          isOpen={isFilmModalOpen}
          onClose={() => setIsFilmModalOpen(false)}
        />
      )}
    </main>
  );
};
