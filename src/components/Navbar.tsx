import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { AudioToggle } from './AudioToggle';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/useTheme';
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
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    if (onNavigate) {
      if (target === 'portfolio') {
        onNavigate('portfolio');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (target === 'about') {
        onNavigate('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (currentView !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
    }
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container-wide navbar-container">
        <a
          href="/"
          className="navbar-brand"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="YOU & ME Wedding Photography Home"
        >
          <img
            src={theme === 'white' ? "/assets/brand/logo_black.png" : "/assets/brand/logo_white.png"}
            alt="YOU & ME"
            className="navbar-logo"
            width="180"
            height="55"
          />
        </a>

        <nav className="navbar-navigation" aria-label="Main Navigation">
          <ul className="navbar-nav">
            <li>
              <a
                href="/portfolio"
                className={`nav-link ${currentView === 'portfolio' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'portfolio')}
              >
                Portfolio
              </a>
            </li>
            <li>
              <a
                href="#films"
                className="nav-link"
                onClick={(e) => handleLinkClick(e, 'films')}
              >
                Films
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={`nav-link ${currentView === 'about' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'about')}
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/client-lounge"
                className={`nav-link ${currentView === 'client-lounge' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('client-lounge');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Client Lounge
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="nav-link"
                onClick={(e) => handleLinkClick(e, 'contact')}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="navbar-actions">
          <ThemeToggle />
          <AudioToggle />

          <button
            type="button"
            className="menu-toggle-btn"
            onClick={onOpenMobileMenu}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
};
