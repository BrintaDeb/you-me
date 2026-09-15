import React, { useEffect, useRef } from 'react';
import { Phone, Mail } from 'lucide-react';
import { businessInfo } from '../data/businessData';
import { useTheme } from '../context/useTheme';
import './Footer.css';

interface FooterProps {
  onNavigate?: (view: string, slug?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const footerRef = useRef<HTMLElement>(null);

  // Parallax watermark: shifts slightly on scroll
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const handleScroll = () => {
      const footer = footerRef.current;
      if (!footer) return;
      const rect = footer.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewportH - rect.top) / (viewportH + rect.height)));
      const offset = (progress - 0.5) * 60; // ±30px parallax shift
      footer.style.setProperty('--footer-parallax', `${offset}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, view: string, hash?: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(view);
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer" role="contentinfo" ref={footerRef}>
      <div className="container-wide">
        <div className="footer-top">
          <div className="footer-brand-col">
            <img
              src={theme === 'white' ? "/assets/brand/logo_black.png" : "/assets/brand/logo_white.png"}
              alt="YOU & ME"
              className="footer-logo"
            />
            <p className="footer-tagline">
              Documentary wedding photography shaped by warmth, emotion, and artistry. Scripting visual love stories that stand the test of time.
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#stories" onClick={(e) => handleLinkClick(e, 'home', 'stories')}>
                  Selected Stories
                </a>
              </li>
              <li>
                <a href="/portfolio" onClick={(e) => handleLinkClick(e, 'portfolio')}>
                  Full Portfolio
                </a>
              </li>
              <li>
                <a href="#films" onClick={(e) => handleLinkClick(e, 'home', 'films')}>
                  Wedding Films
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>
                  About Us
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => handleLinkClick(e, 'home', 'faq')}>
                  FAQ &amp; Packages
                </a>
              </li>
              <li>
                <a href="/client-lounge" onClick={(e) => handleLinkClick(e, 'client-lounge')}>
                  VIP Client Lounge
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4 className="footer-heading">Get in Touch</h4>
            <ul className="footer-links-list">
              <li>
                <a href={`tel:${businessInfo.phoneRaw}`} className="footer-contact-item">
                  <Phone size={15} /> {businessInfo.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${businessInfo.email}`} className="footer-contact-item">
                  <Mail size={15} /> {businessInfo.email}
                </a>
              </li>
              <li>
                <a
                  href={businessInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-item"
                >
                  WhatsApp Studio Direct
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleLinkClick(e, 'home', 'contact')}>
                  Check Your Date &rarr;
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-social-col">
            <h4 className="footer-heading">Follow Our Journey</h4>
            <ul className="footer-links-list">
              <li>
                <a
                  href={businessInfo.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={businessInfo.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={businessInfo.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>© {new Date().getFullYear()} by YOU &amp; ME. All rights reserved.</p>
            <p className="footer-attribution">
              {businessInfo.attribution}
            </p>
          </div>

          <div className="footer-bottom-right">
            <div className="footer-legal-links">
              <a href="/privacy-policy" onClick={(e) => handleLinkClick(e, 'privacy')}>
                Privacy Policy
              </a>
              <span>•</span>
              <a href="/accessibility-statement" onClick={(e) => handleLinkClick(e, 'accessibility')}>
                Accessibility Statement
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
