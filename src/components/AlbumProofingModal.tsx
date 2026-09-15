import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Send,
  Plus,
  Palette,
  Layers,
  ShieldCheck,
  Lock
} from 'lucide-react';
import type { WeddingStory } from '../data/couplesData';
import type { ClientRole } from '../utils/galleryStorage';
import { triggerHaptic } from '../utils/haptics';
import './AlbumProofingModal.css';

export interface AlbumRevisionPin {
  id: string;
  spreadIndex: number;
  photoUrl: string;
  note: string;
  timestamp: string;
  author: string;
}

export type CoverMaterial = 'tuscan-leather' | 'silk-velvet' | 'obsidian-leather' | 'ivory-linen';

export interface MaterialConfig {
  id: CoverMaterial;
  name: string;
  textureLabel: string;
  bgColor: string;
  textColor: string;
  foilBorder: string;
  swatchColor: string;
}

const COVER_MATERIALS: MaterialConfig[] = [
  {
    id: 'tuscan-leather',
    name: 'Tuscan Leather',
    textureLabel: 'Florentine Full-Grain Cowhide',
    bgColor: '#3A1F13',
    textColor: '#F5DEB3',
    foilBorder: 'rgba(212, 175, 55, 0.75)',
    swatchColor: '#683B24'
  },
  {
    id: 'silk-velvet',
    name: 'Royal Silk Velvet',
    textureLabel: 'Bordeaux Hand-Woven Velvet',
    bgColor: '#4A1020',
    textColor: '#FDF3E7',
    foilBorder: 'rgba(240, 203, 107, 0.8)',
    swatchColor: '#7A1C35'
  },
  {
    id: 'obsidian-leather',
    name: 'Obsidian Noir',
    textureLabel: 'Milano Matte Archival Leather',
    bgColor: '#110F0E',
    textColor: '#F5EBE1',
    foilBorder: 'rgba(200, 164, 107, 0.85)',
    swatchColor: '#201D1A'
  },
  {
    id: 'ivory-linen',
    name: 'Ivory Fine Linen',
    textureLabel: 'Museum-Grade Alabaster Bookcloth',
    bgColor: '#EDE6DA',
    textColor: '#261D17',
    foilBorder: 'rgba(158, 116, 50, 0.85)',
    swatchColor: '#E2D5C3'
  }
];

interface AlbumProofingModalProps {
  story: WeddingStory;
  isOpen: boolean;
  onClose: () => void;
  selectedPhotoIds?: string[];
  userRole?: ClientRole;
}

interface AlbumSpread {
  id: string;
  title: string;
  subtitle: string;
  layoutType: 'cover' | 'full-bleed' | 'split-two' | 'triptych' | 'editorial-grid' | 'back-cover';
  leftImage?: string;
  leftCaption?: string;
  rightImage?: string;
  rightCaption?: string;
  panoramicImage?: string;
}

export const AlbumProofingModal: React.FC<AlbumProofingModalProps> = ({
  story,
  isOpen,
  onClose,
  selectedPhotoIds = [],
  userRole = 'couple'
}) => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [selectedMaterial, setSelectedMaterial] = useState<CoverMaterial>('tuscan-leather');
  const [showMaterialMenu, setShowMaterialMenu] = useState(false);
  const [revisionPins, setRevisionPins] = useState<AlbumRevisionPin[]>(() => {
    // Load persisted pins if any
    try {
      const saved = localStorage.getItem(`youandme_album_pins_${story.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [targetPhotoForNote, setTargetPhotoForNote] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [approvalName, setApprovalName] = useState('');
  const [showApprovalSuccess, setShowApprovalSuccess] = useState(false);

  // Generate dynamic 7-spread layflat heirloom album layout using real couple photos
  const candidateImages = story.images.filter(img => selectedPhotoIds.length === 0 || selectedPhotoIds.includes(img.id));
  const pool = candidateImages.length >= 6 ? candidateImages : story.images;

  const spreads: AlbumSpread[] = [
    {
      id: 'spread-0',
      title: 'Linen & Gold Foil Cover',
      subtitle: 'Italian Archival Cloth with Blind Debossing',
      layoutType: 'cover'
    },
    {
      id: 'spread-1',
      title: 'Dedication & Sacred Vows',
      subtitle: 'Opening Editorial Spread',
      layoutType: 'split-two',
      leftImage: pool[0]?.url,
      leftCaption: `${story.title} — Beginning of Forever`,
      rightImage: pool[1]?.url,
      rightCaption: 'Vows exchanged in quiet intimacy'
    },
    {
      id: 'spread-2',
      title: 'Mehendi, Haldi & Morning Rituals',
      subtitle: 'Joyful Vibrance & Family Blessings',
      layoutType: 'split-two',
      leftImage: pool[2]?.url,
      leftCaption: 'Sacred turmeric and laughter',
      rightImage: pool[3]?.url,
      rightCaption: 'Generational blessings'
    },
    {
      id: 'spread-3',
      title: 'The Sacred Mandap & Sindoor Daan',
      subtitle: 'Signature Full-Bleed Panoramic Centerfold',
      layoutType: 'full-bleed',
      panoramicImage: pool[4]?.url || story.heroImage
    },
    {
      id: 'spread-4',
      title: 'Twilight Couple Portraits',
      subtitle: 'Painterly Film Emulation & Golden Hour',
      layoutType: 'split-two',
      leftImage: pool[5]?.url,
      leftCaption: 'Stolen twilight glances',
      rightImage: pool[6]?.url || pool[0]?.url,
      rightCaption: 'Timeless heirloom frames'
    },
    {
      id: 'spread-5',
      title: 'Reception, Feasting & Midnight Dance',
      subtitle: 'Celebration & Joyous Energy',
      layoutType: 'split-two',
      leftImage: pool[7]?.url || pool[2]?.url,
      leftCaption: 'The celebratory toasts',
      rightImage: pool[8]?.url || pool[3]?.url,
      rightCaption: 'Unscripted dance floor joy'
    },
    {
      id: 'spread-6',
      title: 'Archival Seal & Master Crafted Guarantee',
      subtitle: '100-Year Color Guarantee • Hand-bound in Kolkata',
      layoutType: 'back-cover'
    }
  ];

  const handleNext = useCallback(() => {
    if (currentSpread < spreads.length - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      triggerHaptic('pageFlip');
      setTimeout(() => {
        setCurrentSpread(prev => prev + 1);
        setIsFlipping(false);
      }, 350);
    }
  }, [currentSpread, isFlipping, spreads.length]);

  const handlePrev = useCallback(() => {
    if (currentSpread > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      triggerHaptic('pageFlip');
      setTimeout(() => {
        setCurrentSpread(prev => prev - 1);
        setIsFlipping(false);
      }, 350);
    }
  }, [currentSpread, isFlipping]);

  const openNoteDialog = (photoUrl: string) => {
    if (userRole === 'guest') {
      return;
    }
    setTargetPhotoForNote(photoUrl);
    setNoteText('');
    setIsAddingNote(true);
    triggerHaptic('light');
  };

  const saveRevisionNote = () => {
    if (!noteText.trim() || !targetPhotoForNote) return;

    const defaultAuthor = userRole === 'family' ? 'Family Member' : 'Couple';

    const newPin: AlbumRevisionPin = {
      id: `pin-${Date.now()}`,
      spreadIndex: currentSpread,
      photoUrl: targetPhotoForNote,
      note: noteText.trim(),
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      author: approvalName || defaultAuthor
    };

    const updated = [newPin, ...revisionPins];
    setRevisionPins(updated);
    try {
      localStorage.setItem(`youandme_album_pins_${story.id}`, JSON.stringify(updated));
    } catch {}

    setIsAddingNote(false);
    setNoteText('');
    setTargetPhotoForNote(null);
    triggerHaptic('success');
  };

  const handleApproveAlbum = () => {
    if (userRole !== 'couple') {
      return;
    }
    if (isApproved) return;
    const name = prompt('Please enter your name to approve this album design for printing:', approvalName || story.title);
    if (name) {
      setApprovalName(name);
      setIsApproved(true);
      setShowApprovalSuccess(true);
      triggerHaptic('success');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddingNote) setIsAddingNote(false);
        else onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAddingNote, onClose, handleNext, handlePrev]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeSpread = spreads[currentSpread];
  const activePinsForSpread = revisionPins.filter(p => p.spreadIndex === currentSpread);

  const activeMatConfig = COVER_MATERIALS.find(m => m.id === selectedMaterial) || COVER_MATERIALS[0];

  return (
    <div className="album-modal-overlay" role="dialog" aria-modal="true" aria-label="3D Heirloom Album Proofing">
      <div className="album-modal-container">
        {/* Top Header Bar */}
        <header className="album-top-bar">
          <div className="album-header-left">
            <div className="album-badge">
              <BookOpen size={14} className="gold-icon" />
              <span>3D Heirloom Album Proofing</span>
            </div>
            <h2 className="album-modal-title">{story.title} — Fine-Art Panoramic Volume</h2>
          </div>

          <div className="album-spine-info-pill">
            <Layers size={13} className="gold-icon" />
            <span>80 Archival Spreads • 1.2&quot; (30mm) Lay-Flat Spine</span>
          </div>

          <div className="album-header-actions">
            {/* Cover Material Customizer Toggle */}
            <div className="material-selector-wrap">
              <button
                type="button"
                className="material-trigger-btn"
                onClick={() => setShowMaterialMenu(prev => !prev)}
                title="Customize cover binding material"
              >
                <Palette size={14} className="gold-icon" />
                <span className="material-name-label">{activeMatConfig.name}</span>
                <span className="material-swatch-dot" style={{ backgroundColor: activeMatConfig.swatchColor }} />
              </button>

              {showMaterialMenu && (
                <div className="material-dropdown-card">
                  <div className="material-dropdown-title">Select Binding Material</div>
                  {COVER_MATERIALS.map(mat => (
                    <button
                      key={mat.id}
                      type="button"
                      className={`material-option-row ${mat.id === selectedMaterial ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedMaterial(mat.id);
                        setShowMaterialMenu(false);
                        triggerHaptic('light');
                      }}
                    >
                      <span className="option-swatch" style={{ backgroundColor: mat.swatchColor }} />
                      <div className="option-info">
                        <span className="option-name">{mat.name}</span>
                        <span className="option-sub">{mat.textureLabel}</span>
                      </div>
                      {mat.id === selectedMaterial && <CheckCircle2 size={15} className="gold-icon" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Badge */}
            <div className={`album-role-chip role-${userRole}`}>
              {userRole === 'couple' ? (
                <><ShieldCheck size={13} /> Master Suite</>
              ) : userRole === 'family' ? (
                <><ShieldCheck size={13} /> Family Access</>
              ) : (
                <><Lock size={13} /> Guest View</>
              )}
            </div>

            {activePinsForSpread.length > 0 && (
              <span className="album-spread-counter" title="Revision notes on this spread">
                {activePinsForSpread.length} Note{activePinsForSpread.length > 1 ? 's' : ''}
              </span>
            )}
            <span className="album-spread-counter">
              Spread {currentSpread + 1} of {spreads.length}
            </span>

            <button
              type="button"
              className="album-modal-close"
              onClick={onClose}
              aria-label="Close Album Proofing"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Guest / Family Advisory Notice if not Master Couple */}
        {userRole !== 'couple' && (
          <div className="album-tier-notice-banner">
            <Sparkles size={14} className="gold-icon" />
            <span>
              {userRole === 'family'
                ? 'Family Sanctuary Mode: You can view spreads and submit blessings/notes. Final print sign-off is reserved for the Couple Master PIN.'
                : 'Guest Gallery Mode: You are previewing the couple\'s heirloom volume layout. Revision notes and bindery sign-off are reserved for the Couple Master Suite.'}
            </span>
          </div>
        )}

        {/* 3D Book Stage */}
        <div className="album-stage">
          {/* Previous Arrow */}
          <button
            type="button"
            className="album-turn-arrow prev"
            onClick={handlePrev}
            disabled={currentSpread === 0 || isFlipping}
            aria-label="Previous album spread"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Realistic 3D Lay-flat Book Body */}
          <div className={`album-book-wrap ${isFlipping ? `flipping-${flipDirection}` : ''}`}>
            {/* Ambient Spine Shadow */}
            <div className="album-spine-shadow" />

            {/* SPREAD TYPE 1: COVER */}
            {activeSpread.layoutType === 'cover' && (
              <div
                className={`album-cover-surface material-${selectedMaterial}`}
                style={{
                  backgroundColor: activeMatConfig.bgColor,
                  color: activeMatConfig.textColor
                }}
              >
                <div
                  className="cover-gold-border"
                  style={{
                    borderColor: activeMatConfig.foilBorder,
                    outlineColor: activeMatConfig.foilBorder
                  }}
                >
                  <div className="cover-monogram">
                    <Sparkles size={28} className="gold-icon" />
                  </div>
                  <h1 className="cover-story-title">{story.title.toUpperCase()}</h1>
                  <p className="cover-subtitle">A SACRED WEDDING CHRONICLE</p>
                  <div className="cover-divider" />
                  <p className="cover-meta">{story.category} • MASTER ARTISAN VOLUME</p>
                  <p className="cover-tagline">&ldquo;{story.tagline}&rdquo;</p>
                  <div className="cover-material-badge">
                    <span>{activeMatConfig.name.toUpperCase()} • {activeMatConfig.textureLabel.toUpperCase()}</span>
                  </div>
                  <div className="cover-seal">YOU &amp; ME FINE-ART ARCHIVAL PRESS</div>
                </div>
              </div>
            )}

            {/* SPREAD TYPE 2: SPLIT-TWO (Double Page Editorial) */}
            {activeSpread.layoutType === 'split-two' && (
              <div className="album-pages-container">
                {/* Left Page */}
                <div className="album-page left-page">
                  <div className="album-photo-frame" onClick={() => activeSpread.leftImage && openNoteDialog(activeSpread.leftImage)}>
                    {activeSpread.leftImage && (
                      <img src={activeSpread.leftImage} alt="Album left page frame" className="album-rendered-img" />
                    )}
                    <button type="button" className="photo-pin-trigger" title="Add revision request to this frame">
                      <Plus size={14} /> Add Note
                    </button>
                  </div>
                  <p className="album-photo-caption">{activeSpread.leftCaption}</p>
                  <span className="album-folio-num">{currentSpread * 2}</span>
                </div>

                {/* Center Book Gutter */}
                <div className="album-gutter" />

                {/* Right Page */}
                <div className="album-page right-page">
                  <div className="album-photo-frame" onClick={() => activeSpread.rightImage && openNoteDialog(activeSpread.rightImage)}>
                    {activeSpread.rightImage && (
                      <img src={activeSpread.rightImage} alt="Album right page frame" className="album-rendered-img" />
                    )}
                    <button type="button" className="photo-pin-trigger" title="Add revision request to this frame">
                      <Plus size={14} /> Add Note
                    </button>
                  </div>
                  <p className="album-photo-caption">{activeSpread.rightCaption}</p>
                  <span className="album-folio-num">{currentSpread * 2 + 1}</span>
                </div>
              </div>
            )}

            {/* SPREAD TYPE 3: FULL-BLEED PANORAMIC */}
            {activeSpread.layoutType === 'full-bleed' && (
              <div className="album-pages-container panoramic">
                <div className="album-page panoramic-page">
                  <div className="album-photo-frame full-bleed" onClick={() => activeSpread.panoramicImage && openNoteDialog(activeSpread.panoramicImage)}>
                    {activeSpread.panoramicImage && (
                      <img src={activeSpread.panoramicImage} alt="Panoramic mandap centerfold" className="album-rendered-img panoramic" />
                    )}
                    <button type="button" className="photo-pin-trigger" title="Add revision request to this spread">
                      <Plus size={14} /> Add Note
                    </button>
                  </div>
                  <div className="album-gutter" />
                  <div className="panoramic-overlay-meta">
                    <h3>{activeSpread.title}</h3>
                    <p>{story.title} — Lay-flat Continuous 24&quot; Centerfold</p>
                  </div>
                </div>
              </div>
            )}

            {/* SPREAD TYPE 4: BACK COVER */}
            {activeSpread.layoutType === 'back-cover' && (
              <div className="album-cover-surface back-cover">
                <div className="back-cover-content">
                  <div className="archival-seal-badge">
                    <CheckCircle2 size={36} className="gold-icon" />
                  </div>
                  <h3>MUSEUM-GRADE ARCHIVAL SPECIFICATION</h3>
                  <p className="seal-text">
                    Printed on 310gsm archival cotton rag with 100-year color fidelity ink. Handcrafted and bound with genuine Italian silk thread by master bookbinders in Kolkata.
                  </p>
                  <div className="seal-craftsmen">
                    <span>Brinta Deb • Creative Director</span>
                    <span>Debolina Sen • Master Colorist</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            className="album-turn-arrow next"
            onClick={handleNext}
            disabled={currentSpread === spreads.length - 1 || isFlipping}
            aria-label="Next album spread"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Bottom Control Bar & Thumbnail Nav */}
        <footer className="album-bottom-bar">
          <div className="album-thumbnail-track">
            {spreads.map((spread, idx) => (
              <button
                key={spread.id}
                type="button"
                className={`album-spread-thumb ${idx === currentSpread ? 'active' : ''}`}
                onClick={() => {
                  setCurrentSpread(idx);
                  triggerHaptic('pageFlip');
                }}
              >
                <span className="thumb-index">{idx === 0 ? 'Cover' : idx === spreads.length - 1 ? 'Back' : `${idx}`}</span>
                <span className="thumb-name">{spread.title}</span>
              </button>
            ))}
          </div>

          <div className="album-footer-actions">
            <div className="revisions-counter">
              <MessageSquare size={16} className="gold-icon" />
              <span>{revisionPins.length} Revision Notes</span>
            </div>

            <button
              type="button"
              className={`btn btn-approve-album ${isApproved ? 'is-approved' : ''} ${userRole !== 'couple' && !isApproved ? 'is-disabled' : ''}`}
              onClick={handleApproveAlbum}
              disabled={userRole !== 'couple' && !isApproved}
              title={userRole !== 'couple' ? 'Album approval reserved for Couple Master PIN' : 'Approve album design for bindery print run'}
            >
              <CheckCircle2 size={16} />
              {isApproved
                ? 'Album Approved For Print'
                : userRole === 'couple'
                  ? 'Approve Album Design'
                  : 'Approval Locked (Couple PIN)'}
            </button>
          </div>
        </footer>

        {/* Floating Revision Note Dialog Modal */}
        {isAddingNote && (
          <div className="note-dialog-overlay" onClick={() => setIsAddingNote(false)}>
            <div className="note-dialog-card" onClick={e => e.stopPropagation()}>
              <div className="note-dialog-header">
                <h4>Add Revision Request for this Frame</h4>
                <button type="button" onClick={() => setIsAddingNote(false)} className="note-dialog-close">
                  <X size={18} />
                </button>
              </div>

              {targetPhotoForNote && (
                <div className="note-dialog-preview">
                  <img src={targetPhotoForNote} alt="Target frame for revision" />
                </div>
              )}

              <div className="note-dialog-body">
                <label htmlFor="revision-text">Your note for the album designer / colorist:</label>
                <textarea
                  id="revision-text"
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="e.g. Please swap this image with candid frame #14, or convert this spread to high-contrast black & white..."
                  autoFocus
                />

                <div className="note-dialog-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setIsAddingNote(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={saveRevisionNote}>
                    <Send size={14} /> Save Revision Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Success Modal */}
        {showApprovalSuccess && (
          <div className="approval-modal-overlay" onClick={() => setShowApprovalSuccess(false)}>
            <div className="approval-modal-card" onClick={e => e.stopPropagation()}>
              <CheckCircle2 size={48} className="gold-icon" />
              <h3>Album Design Approved!</h3>
              <p>
                Thank you, <strong>{approvalName || 'Valued Couple'}</strong>. Your final heirloom layout has been signed off.
                The YOU & ME studio team and master colorist have been notified to initiate the fine-art cotton print run!
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowApprovalSuccess(false)}
              >
                Back to Album Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
