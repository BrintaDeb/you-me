import React, { useEffect, useRef } from 'react';
import { X, Phone, Mail, ArrowRight } from 'lucide-react';
import { businessInfo } from '../data/businessData';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/useTheme';
import './MobileMenu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, slug?: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (closeBtnRef.current) closeBtnRef.current.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const handleNavClick = (view: string, hash?: string) => {
    onClose();
    onNavigate(view);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      <div className="mobile-menu-header">
        <img
          src={theme === 'white' ? "/assets/brand/logo_black.png" : "/assets/brand/logo_white.png"}
          alt="YOU & ME"
          className="mobile-logo"
        />
        <div className="mobile-header-actions">
          <ThemeToggle />
          <button
            ref={closeBtnRef}
            type="button"
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <ul className="mobile-nav-list">
        <li className="mobile-nav-item">
          <a
            href="/portfolio"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('portfolio');
            }}
          >
            Full Portfolio <ArrowRight size={20} opacity={0.6} />
          </a>
        </li>
        <li className="mobile-nav-item">
          <a
            href="#films"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', 'films');
            }}
          >
            Wedding Films <ArrowRight size={20} opacity={0.6} />
          </a>
        </li>
        <li className="mobile-nav-item">
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('about');
            }}
          >
            About Us <ArrowRight size={20} opacity={0.6} />
          </a>
        </li>
        <li className="mobile-nav-item">
          <a
            href="/client-lounge"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('client-lounge');
            }}
          >
            Client Lounge (VIP) <ArrowRight size={20} opacity={0.6} />
          </a>
        </li>
        <li className="mobile-nav-item">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', 'contact');
            }}
          >
            Check Your Date <ArrowRight size={20} opacity={0.6} />
          </a>
        </li>
      </ul>

      <div className="mobile-menu-footer">
        <div className="mobile-contact-links">
          <a href={`tel:${businessInfo.phoneRaw}`}>
            <Phone size={16} /> {businessInfo.phone}
          </a>
          <a href={`mailto:${businessInfo.email}`}>
            <Mail size={16} /> {businessInfo.email}
          </a>
        </div>

        <div className="mobile-socials">
          <a
            href={businessInfo.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-social-link"
          >
            Instagram
          </a>
          <a
            href={businessInfo.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-social-link"
          >
            Facebook
          </a>
          <a
            href={businessInfo.socials.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-social-link"
          >
            YouTube
          </a>
        </div>
      </div>
    </div>
  );
};
