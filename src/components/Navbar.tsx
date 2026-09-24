import React, { useState, useEffect } from 'react';
import { Menu, X, House, Film, Heart, Info, Key, Calendar } from 'lucide-react';
import { AudioToggle } from './AudioToggle';
import { ThemeToggle } from './ThemeToggle';
import { businessInfo } from '../data/businessData';
import { smoothScrollTo } from '../hooks/useSmoothScroll';
import './Navbar.css';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  currentView?: string;
  onNavigate?: (view: string, slug?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  isMobileMenuOpen,
  currentView = 'home',
  onNavigate
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    if (onNavigate) {
      if (target === 'portfolio') {
        onNavigate('portfolio');
        smoothScrollTo(0);
        return;
      }
      if (target === 'celebrations' || target === 'packages') {
        onNavigate('celebrations');
        smoothScrollTo(0);
        return;
      }
      if (target === 'about') {
        onNavigate('about');
        smoothScrollTo(0);
        return;
      }
      if (target === 'client-lounge') {
        onNavigate('client-lounge');
        smoothScrollTo(0);
        return;
      }
      if (currentView !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          smoothScrollTo(target);
        }, 120);
        return;
      }
    }
    smoothScrollTo(target);
  };

  return (
    <header className={`floating-pill-header ${isScrolled ? 'is-scrolled' : ''}`}>
      {/* Brand Logo — Floating Standalone Outside Header Section */}
      <a
        href="/"
        className="standalone-brand-logo"
        onClick={(e) => {
          e.preventDefault();
          if (onNavigate) onNavigate('home');
          smoothScrollTo(0);
        }}
        aria-label="YOU & ME Wedding Photography Home"
      >
        <img
          src="/assets/brand/logo_white.png"
          alt="YOU & ME"
          className="brand-logo-img logo-theme-dark"
          width="150"
          height="45"
        />
        <img
          src="/assets/brand/logo_black.png"
          alt="YOU & ME"
          className="brand-logo-img logo-theme-light"
          width="150"
          height="45"
        />
      </a>

      {/* Centered Floating Header Section with Buttons */}
      <div className="pill-navbar-container">

        {/* Desktop Centered Pill Navigation Items */}
        <nav className="pill-navigation" aria-label="Main Navigation">
          <ul className="pill-nav-list">
            <li>
              <a
                href="/"
                className={`pill-nav-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'home')}
              >
                <div className="pill-icon-badge">
                  <House size={15} />
                </div>
                <span className="pill-nav-label">Home</span>
              </a>
            </li>

            <li>
              <a
                href="/portfolio"
                className={`pill-nav-item ${currentView === 'portfolio' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'portfolio')}
              >
                <div className="pill-icon-badge">
                  <Film size={15} />
                </div>
                <span className="pill-nav-label">Stories</span>
              </a>
            </li>

            <li>
              <a
                href="/celebrations"
                className={`pill-nav-item ${currentView === 'celebrations' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'celebrations')}
              >
                <div className="pill-icon-badge">
                  <Heart size={15} />
                </div>
                <span className="pill-nav-label">Celebrations</span>
              </a>
            </li>

            <li>
              <a
                href="#about"
                className={`pill-nav-item ${currentView === 'about' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'about')}
              >
                <div className="pill-icon-badge">
                  <Info size={15} />
                </div>
                <span className="pill-nav-label">About</span>
              </a>
            </li>

            <li>
              <a
                href="/client-lounge"
                className={`pill-nav-item ${currentView === 'client-lounge' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'client-lounge')}
              >
                <div className="pill-icon-badge">
                  <Key size={15} />
                </div>
                <span className="pill-nav-label">Client Lounge</span>
              </a>
            </li>

            <li>
              <a
                href="#contact"
                className="pill-nav-item"
                onClick={(e) => handleLinkClick(e, 'contact')}
              >
                <div className="pill-icon-badge">
                  <Calendar size={15} />
                </div>
                <span className="pill-nav-label">Contact</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Elegant Hairline Divider */}
        <div className="pill-nav-divider" aria-hidden="true" />

        {/* Action Buttons & Utilities */}
        <div className="pill-navbar-actions">
          {/* WhatsApp Direct Launcher */}
          <a
            href={businessInfo.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-whatsapp-btn"
            title="Chat directly on WhatsApp"
            aria-label="Direct WhatsApp Studio Consultation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </a>

          <ThemeToggle />
          <AudioToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="pill-menu-toggle"
            onClick={onOpenMobileMenu}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};
