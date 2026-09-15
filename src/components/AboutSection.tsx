import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Film,
  Palette,
  Eye,
  Heart,
  ArrowRight,
  Quote,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sliders,
  Layers,
  ShieldCheck
} from 'lucide-react';
import {
  businessInfo,
  teamMembers,
  dynamicAboutPhotos,
  studioPillars,
  studioMetrics
} from '../data/businessData';
import type { TeamMember } from '../data/businessData';
import { AboutLightbox } from './AboutLightbox';
import './AboutSection.css';

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const AboutSection: React.FC = () => {
  // Team filter & modal state
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'direction' | 'cinematography' | 'candid' | 'post'>('all');

  // Dynamic Photo Showcase State
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const autoPlayTimerRef = useRef<number | null>(null);
  const teamGridRef = useRef<HTMLDivElement>(null);

  // Staggered entrance animation for team cards
  useEffect(() => {
    const grid = teamGridRef.current;
    if (!grid) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Immediately make all cards visible for reduced-motion users
      grid.querySelectorAll<HTMLElement>('.team-card').forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cards = grid.querySelectorAll<HTMLElement>('.team-card');
            cards.forEach((card, idx) => {
              setTimeout(() => card.classList.add('animate-in'), idx * 100);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, [activeTab]);

  // Auto-advance photos every 5.5s when playing
  useEffect(() => {
    if (!isAutoPlaying || isLightboxOpen) return;

    autoPlayTimerRef.current = window.setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % dynamicAboutPhotos.length);
    }, 5500);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, isLightboxOpen]);

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + dynamicAboutPhotos.length) % dynamicAboutPhotos.length);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % dynamicAboutPhotos.length);
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleScrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredMembers = teamMembers.filter((member) => {
    if (activeTab === 'direction') return member.id === 'brinta-deb';
    if (activeTab === 'cinematography') return member.id === 'sayan-mukherjee';
    if (activeTab === 'candid') return member.id === 'anirban-roy';
    if (activeTab === 'post') return member.id === 'debolina-sen';
    return true;
  });

  const getRoleIcon = (id: string) => {
    switch (id) {
      case 'brinta-deb':
        return <Camera size={16} />;
      case 'sayan-mukherjee':
        return <Film size={16} />;
      case 'anirban-roy':
        return <Eye size={16} />;
      case 'debolina-sen':
        return <Palette size={16} />;
      default:
        return <Camera size={16} />;
    }
  };

  const currentPhoto = dynamicAboutPhotos[activePhotoIndex];
  // Secondary frame shows the next photograph in rotation
  const nextPhotoIndex = (activePhotoIndex + 1) % dynamicAboutPhotos.length;
  const secondaryPhoto = dynamicAboutPhotos[nextPhotoIndex];

  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="container-wide">
        {/* Top Story & Dynamic Media Showcase Grid */}
        <div className="about-intro-grid">
          {/* Narrative Column */}
          <div className="about-intro-text">
            <div className="eyebrow">
              <Sparkles size={14} /> The Artists Behind You &amp; Me
            </div>

            <h2 id="about-heading" className="about-title">
              About Us — Scripting Visual Love Stories
            </h2>

            {businessInfo.about.paragraphs.map((para, i) => (
              <p key={i} className="about-p">
                {para}
              </p>
            ))}

            <div className="about-highlight-box">
              <Camera size={17} className="highlight-icon" />
              <span>{businessInfo.about.highlight}</span>
            </div>

            {/* Credibility & Trust Metrics Bar */}
            <div className="about-metrics-bar">
              {studioMetrics.map((metric, i) => (
                <div key={i} className="metric-item">
                  <span className="metric-value">{metric.value}</span>
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-detail">{metric.detail}</span>
                </div>
              ))}
            </div>

            <div className="about-actions-row">
              <a
                href="#contact"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToContact();
                }}
              >
                Check Date with Our Team <ArrowRight size={16} />
              </a>

              <button
                type="button"
                className="btn btn-outline about-expand-gallery-btn"
                onClick={() => handleOpenLightbox(activePhotoIndex)}
              >
                <Maximize2 size={15} /> View Master Gallery ({dynamicAboutPhotos.length} Frames)
              </button>
            </div>
          </div>

          {/* Dynamic Media Showcase Column */}
          <div
            className="about-media-composition"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <img
              src="/assets/brand/double_heart.png"
              alt=""
              className="about-heart-badge"
              aria-hidden="true"
            />

            {/* Main Interactive Dynamic Frame */}
            <div
              className="about-frame-main dynamic-showcase-frame"
              onClick={() => handleOpenLightbox(activePhotoIndex)}
              role="button"
              tabIndex={0}
              aria-label={`Open photo in lightbox: ${currentPhoto.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpenLightbox(activePhotoIndex);
                }
              }}
            >
              <img
                key={currentPhoto.id}
                src={currentPhoto.url}
                alt={currentPhoto.title}
                className="dynamic-main-img"
                loading="eager"
              />

              {/* Gradient Vignette */}
              <div className="dynamic-frame-overlay" />

              {/* Top HUD: Category & Fullscreen Prompt */}
              <div className="dynamic-hud-top">
                <span className="dynamic-tag-pill">
                  <Sparkles size={12} /> {currentPhoto.tag}
                </span>
                <span className="dynamic-counter-pill">
                  {String(activePhotoIndex + 1).padStart(2, '0')} / {String(dynamicAboutPhotos.length).padStart(2, '0')}
                </span>
              </div>

              {/* Bottom HUD: Craft Details & Click to Expand */}
              <div className="dynamic-hud-bottom">
                <div className="dynamic-hud-text">
                  <h4 className="dynamic-hud-title">{currentPhoto.title}</h4>
                  <p className="dynamic-hud-sub">{currentPhoto.subtitle}</p>
                  <div className="dynamic-hud-gear">
                    <Camera size={12} /> {currentPhoto.gear}
                  </div>
                </div>

                <div className="dynamic-hud-expand-pill">
                  <Maximize2 size={13} />
                  <span>Expand Lightbox</span>
                </div>
              </div>

              {/* Arrow Nav Buttons */}
              <button
                type="button"
                className="dynamic-arrow-btn prev"
                onClick={handlePrevPhoto}
                aria-label="Previous photograph"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="dynamic-arrow-btn next"
                onClick={handleNextPhoto}
                aria-label="Next photograph"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Thumbnail Pills Selector */}
            <div className="dynamic-thumb-pills" role="tablist" aria-label="Quick jump to photograph">
              {dynamicAboutPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activePhotoIndex}
                  className={`dynamic-thumb-dot ${idx === activePhotoIndex ? 'active' : ''}`}
                  onClick={() => setActivePhotoIndex(idx)}
                  title={photo.title}
                  aria-label={`Jump to slide ${idx + 1}: ${photo.title}`}
                />
              ))}
            </div>

            {/* Secondary Companion Floating Frame */}
            <div
              className="about-frame-secondary"
              onClick={() => handleOpenLightbox(nextPhotoIndex)}
              role="button"
              tabIndex={0}
              title={`Next frame: ${secondaryPhoto.title}. Click to view in Lightbox.`}
              aria-label={`Next photograph: ${secondaryPhoto.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpenLightbox(nextPhotoIndex);
                }
              }}
            >
              <img
                src={secondaryPhoto.url}
                alt={secondaryPhoto.title}
                loading="lazy"
              />
              <div className="secondary-hover-glow" />
              <div className="secondary-tag-chip">
                <span>Next Frame &rarr;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Studio Craft Pillars */}
        <div className="about-pillars-section">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            <Layers size={13} /> Our Artistic Tenets
          </div>
          <h3 className="about-pillars-title">The Foundation of Our Visual Language</h3>
          <p className="about-pillars-sub">
            Three disciplined principles that separate artisanal documentary heirloom filmmaking from conventional wedding photography.
          </p>

          <div className="about-pillars-grid">
            {studioPillars.map((pillar) => (
              <article key={pillar.id} className="pillar-card">
                <div className="pillar-card-header">
                  <span className="pillar-number">{pillar.number}</span>
                  <div className="pillar-card-badge">
                    <ShieldCheck size={14} /> Documented Standard
                  </div>
                </div>
                <h4 className="pillar-title">{pillar.title}</h4>
                <p className="pillar-tagline">{pillar.tagline}</p>
                <p className="pillar-desc">{pillar.description}</p>
                <div className="pillar-craft-focus">
                  <Sliders size={13} />
                  <span>{pillar.craftFocus}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Team Collective Header & Interactive Role Filter */}
        <div className="about-team-header">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            <Heart size={13} fill="currentColor" /> Meet Our Collective
          </div>
          <h3 className="about-team-title">
            The Creative Minds Guiding Your Day
          </h3>
          <p className="about-team-subtitle">
            Every wedding commission is personally crafted by our core specialists. Click any artist to explore their philosophy, equipment, and signature captures.
          </p>

          <div className="team-filter-tabs" role="tablist" aria-label="Filter team members by specialization">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`team-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Specialists
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'direction'}
              className={`team-tab-btn ${activeTab === 'direction' ? 'active' : ''}`}
              onClick={() => setActiveTab('direction')}
            >
              <Camera size={14} /> Direction &amp; Portraits
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'cinematography'}
              className={`team-tab-btn ${activeTab === 'cinematography' ? 'active' : ''}`}
              onClick={() => setActiveTab('cinematography')}
            >
              <Film size={14} /> Cinematography
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'candid'}
              className={`team-tab-btn ${activeTab === 'candid' ? 'active' : ''}`}
              onClick={() => setActiveTab('candid')}
            >
              <Eye size={14} /> Candid Documentary
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'post'}
              className={`team-tab-btn ${activeTab === 'post' ? 'active' : ''}`}
              onClick={() => setActiveTab('post')}
            >
              <Palette size={14} /> Color &amp; Print
            </button>
          </div>
        </div>

        {/* Interactive Team Cards Grid with Signature Previews */}
        <div className="team-cards-grid" ref={teamGridRef}>
          {filteredMembers.map((member) => (
            <article
              key={member.id}
              className="team-card"
              onClick={() => setSelectedMember(member)}
              role="button"
              tabIndex={0}
              aria-label={`View detailed profile and signature works for ${member.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedMember(member);
                }
              }}
            >
              <div className="team-card-image-wrap">
                <img
                  src={member.image}
                  alt={`${member.name} - ${member.role}`}
                  className="team-card-image"
                  loading="lazy"
                />
                <div className="team-card-overlay-gradient" />
                <div className="team-card-role-pill">
                  {getRoleIcon(member.id)}
                  <span>{member.role}</span>
                </div>
                <div className="team-card-stat-chip">
                  <strong>{member.stats.value}</strong>
                  <span>{member.stats.label}</span>
                </div>
              </div>

              <div className="team-card-body">
                <h4 className="team-member-name">{member.name}</h4>
                <p className="team-member-tagline">{member.tagline}</p>
                <div className="team-member-specialty">
                  <span>Specialty:</span> {member.specialty}
                </div>

                {/* Signature Works Miniature Strip */}
                {member.signatureWorks && member.signatureWorks.length > 0 && (
                  <div className="team-signature-preview-row">
                    <span className="signature-preview-label">Signature Works:</span>
                    <div className="signature-thumbnails-list">
                      {member.signatureWorks.slice(0, 3).map((sig) => (
                        <div key={sig.id} className="signature-mini-chip" title={sig.title}>
                          <img src={sig.url} alt={sig.title} loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="team-card-footer">
                  <span className="team-card-explore-link">
                    Explore Profile &amp; Works &rarr;
                  </span>
                  <span className="team-card-social">
                    <InstagramIcon size={14} /> {member.socialHandle}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Interactive Team Member Spotlight Modal with Signature Portfolio */}
      {selectedMember && (
        <div
          className="team-modal-backdrop"
          onClick={() => setSelectedMember(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedMember.name} Profile and Portfolio`}
        >
          <div
            className="team-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="team-modal-close-btn"
              onClick={() => setSelectedMember(null)}
              aria-label="Close team member details"
            >
              <X size={20} />
            </button>

            <div className="team-modal-grid">
              <div className="team-modal-image-col">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="team-modal-image"
                />
                <div className="team-modal-role-badge">
                  {getRoleIcon(selectedMember.id)}
                  <span>{selectedMember.role}</span>
                </div>
              </div>

              <div className="team-modal-content-col">
                <div className="team-modal-header">
                  <h3 className="team-modal-name">{selectedMember.name}</h3>
                  <p className="team-modal-tagline">{selectedMember.tagline}</p>
                </div>

                <div className="team-modal-bio">
                  <p>{selectedMember.bio}</p>
                </div>

                {selectedMember.favoriteQuote && (
                  <div className="team-modal-quote-box">
                    <Quote size={18} className="modal-quote-icon" />
                    <p className="team-modal-quote">
                      &ldquo;{selectedMember.favoriteQuote}&rdquo;
                    </p>
                  </div>
                )}

                <div className="team-modal-stats-row">
                  <div className="modal-stat-item">
                    <span className="modal-stat-label">Specialization</span>
                    <span className="modal-stat-value">{selectedMember.specialty}</span>
                  </div>
                  <div className="modal-stat-item">
                    <span className="modal-stat-label">{selectedMember.stats.label}</span>
                    <span className="modal-stat-value accent">{selectedMember.stats.value}</span>
                  </div>
                  {selectedMember.experienceYears && (
                    <div className="modal-stat-item">
                      <span className="modal-stat-label">Experience</span>
                      <span className="modal-stat-value">{selectedMember.experienceYears}</span>
                    </div>
                  )}
                </div>

                {selectedMember.gear && (
                  <div className="team-modal-gear-row">
                    <Camera size={14} className="gear-icon" />
                    <span><strong>Primary Equipment:</strong> {selectedMember.gear}</span>
                  </div>
                )}

                {/* Signature Works Carousel inside Modal */}
                {selectedMember.signatureWorks && selectedMember.signatureWorks.length > 0 && (
                  <div className="team-modal-signature-section">
                    <h5 className="modal-signature-title">
                      Signature Captures by {selectedMember.name.split(' ')[0]}
                      <span className="modal-signature-hint">(Click any to inspect in Lightbox)</span>
                    </h5>
                    <div className="modal-signature-grid">
                      {selectedMember.signatureWorks.map((sig) => {
                        const targetPhotoIndex = dynamicAboutPhotos.findIndex(p => p.url === sig.url);
                        return (
                          <div
                            key={sig.id}
                            className="modal-signature-card"
                            onClick={() => {
                              setSelectedMember(null);
                              handleOpenLightbox(targetPhotoIndex !== -1 ? targetPhotoIndex : 0);
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`View ${sig.title} in Lightbox`}
                          >
                            <img src={sig.url} alt={sig.title} loading="lazy" />
                            <div className="modal-sig-overlay">
                              <span className="modal-sig-title">{sig.title}</span>
                              <span className="modal-sig-cat">{sig.category}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Team Member Info Box Panels (No Button) */}
                <div
                  className="team-modal-info-panels"
                  role="region"
                  aria-label={`Atelier assignment and booking information for ${selectedMember.name}`}
                >
                  <div className="team-info-panel-card">
                    <div className="team-info-panel-header">
                      <div className="team-info-panel-title-wrap">
                        <Sparkles size={15} className="team-info-panel-icon" />
                        <span>{selectedMember.infoPanels?.roleScope.title || "Atelier Role & Coverage"}</span>
                      </div>
                      <span className="team-info-panel-badge">Core Atelier</span>
                    </div>
                    <p className="team-info-panel-desc">
                      {selectedMember.infoPanels?.roleScope.description}
                    </p>
                    <div className="team-info-panel-footer">
                      <span className="team-info-footer-label">Scope</span>
                      <span className="team-info-footer-val">{selectedMember.infoPanels?.roleScope.focus}</span>
                    </div>
                  </div>

                  <div className="team-info-panel-card">
                    <div className="team-info-panel-header">
                      <div className="team-info-panel-title-wrap">
                        <ShieldCheck size={15} className="team-info-panel-icon" />
                        <span>{selectedMember.infoPanels?.bookingPolicy.title || "Collective Atelier Booking"}</span>
                      </div>
                      <span className="team-info-panel-badge">Studio Policy</span>
                    </div>
                    <p className="team-info-panel-desc">
                      {selectedMember.infoPanels?.bookingPolicy.description}
                    </p>
                    <div className="team-info-panel-footer">
                      <span className="team-info-footer-label">Availability</span>
                      <span className="team-info-footer-val">{selectedMember.infoPanels?.bookingPolicy.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Master Lightbox */}
      <AboutLightbox
        photos={dynamicAboutPhotos}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        onBookCta={handleScrollToContact}
      />
    </section>
  );
};
