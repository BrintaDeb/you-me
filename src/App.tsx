import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileMenu } from './components/MobileMenu';
import { Footer } from './components/Footer';
import { CameraPathExperience } from './components/CameraPathExperience';
import { AboutSection } from './components/AboutSection';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { WeddingFilmsSection } from './components/WeddingFilmsSection';
import { FaqSection } from './components/FaqSection';
import { EnquirySection } from './components/EnquirySection';
import { VideoModal } from './components/VideoModal';
import { PortfolioPage } from './pages/PortfolioPage';
import { StoryGalleryPage } from './pages/StoryGalleryPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { couplesData } from './data/couplesData';
import type { WeddingStory } from './data/couplesData';
import { audioAtmosphere } from './utils/audioAtmosphere';
import { HeartCursor } from './components/HeartCursor';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'portfolio' | 'story' | 'about' | 'privacy' | 'accessibility'>('home');
  const [selectedStory, setSelectedStory] = useState<WeddingStory | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilmStory, setActiveFilmStory] = useState<WeddingStory | null>(null);

  // Smart audio ducking when wedding film modal is playing
  useEffect(() => {
    audioAtmosphere.setDucked(!!activeFilmStory);
  }, [activeFilmStory]);

  // Parse path on initial load & handle browser back/forward
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

      if (pathname === '/portfolio') {
        setCurrentView('portfolio');
        setSelectedStory(null);
      } else if (pathname.startsWith('/portfolio/')) {
        const slug = pathname.replace('/portfolio/', '');
        const found = couplesData.find(c => c.slug === slug);
        if (found) {
          setSelectedStory(found);
          setCurrentView('story');
        } else {
          setCurrentView('portfolio');
        }
      } else if (pathname === '/about' || pathname === '/contact') {
        setCurrentView('about');
        setSelectedStory(null);
      } else if (pathname === '/privacy-policy') {
        setCurrentView('privacy');
        setSelectedStory(null);
      } else if (pathname === '/accessibility-statement') {
        setCurrentView('accessibility');
        setSelectedStory(null);
      } else {
        // Check for legacy Wix blank-* paths
        const legacyMatch = couplesData.find(c => {
          const legacyPath = new URL(c.legacyUrl).pathname.toLowerCase();
          return legacyPath === pathname;
        });

        if (legacyMatch) {
          setSelectedStory(legacyMatch);
          setCurrentView('story');
          window.history.replaceState(null, '', `/portfolio/${legacyMatch.slug}`);
        } else {
          setCurrentView('home');
          setSelectedStory(null);
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update document title dynamically
  useEffect(() => {
    if (currentView === 'story' && selectedStory) {
      document.title = `${selectedStory.title} — Wedding Story | YOU & ME`;
    } else if (currentView === 'portfolio') {
      document.title = 'Portfolio & Archive | YOU & ME Wedding Photography';
    } else if (currentView === 'about') {
      document.title = 'About Team & Contact | YOU & ME Wedding Photography';
    } else if (currentView === 'privacy') {
      document.title = 'Privacy Policy | YOU & ME';
    } else if (currentView === 'accessibility') {
      document.title = 'Accessibility Statement | YOU & ME';
    } else {
      document.title = 'YOU & ME — Cinematic Wedding Photography';
    }
  }, [currentView, selectedStory]);

  const navigateTo = (view: string, slug?: string) => {
    if (view === 'story' && slug) {
      const found = couplesData.find(c => c.slug === slug);
      if (found) {
        setSelectedStory(found);
        setCurrentView('story');
        window.history.pushState(null, '', `/portfolio/${slug}`);
      }
    } else if (view === 'portfolio') {
      setCurrentView('portfolio');
      setSelectedStory(null);
      window.history.pushState(null, '', '/portfolio');
    } else if (view === 'about') {
      setCurrentView('about');
      setSelectedStory(null);
      window.history.pushState(null, '', '/about');
    } else if (view === 'privacy') {
      setCurrentView('privacy');
      setSelectedStory(null);
      window.history.pushState(null, '', '/privacy-policy');
    } else if (view === 'accessibility') {
      setCurrentView('accessibility');
      setSelectedStory(null);
      window.history.pushState(null, '', '/accessibility-statement');
    } else {
      setCurrentView('home');
      setSelectedStory(null);
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStory = (story: WeddingStory) => {
    setSelectedStory(story);
    setCurrentView('story');
    window.history.pushState(null, '', `/portfolio/${story.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      {/* Interactive Heart Cursor */}
      <HeartCursor />

      {/* Accessible skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        currentView={currentView}
        onNavigate={navigateTo}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={navigateTo}
      />

      {currentView === 'home' && (
        <main id="main-content">
          {/* Scene 1 & Scene 2 — Opening Hero & 3D Camera-Path Space */}
          <CameraPathExperience
            onSelectStory={handleSelectStory}
            onPlayFilm={(story) => setActiveFilmStory(story)}
          />

          {/* Scene 3 — About You & Me */}
          <AboutSection />

          {/* Scene 4 — Signature Portfolio Showcase */}
          <PortfolioShowcase
            onSelectStory={handleSelectStory}
            onViewAllPortfolio={() => navigateTo('portfolio')}
          />

          {/* Scene 5 — Wedding Films (Love in Motion) */}
          <WeddingFilmsSection
            onPlayFilm={(story) => setActiveFilmStory(story)}
          />

          {/* Scene 6 — Trust and FAQ */}
          <FaqSection />

          {/* Scene 7 — Commercial Enquiry Finale */}
          <EnquirySection />
        </main>
      )}

      {currentView === 'portfolio' && (
        <PortfolioPage
          onSelectStory={handleSelectStory}
        />
      )}

      {currentView === 'story' && selectedStory && (
        <StoryGalleryPage
          story={selectedStory}
          onBackToPortfolio={() => navigateTo('portfolio')}
          onSelectStory={handleSelectStory}
          onPlayFilm={(story) => setActiveFilmStory(story)}
          onCheckDate={() => {
            navigateTo('home');
            setTimeout(() => {
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />
      )}

      {currentView === 'about' && (
        <AboutPage />
      )}

      {currentView === 'privacy' && (
        <PrivacyPolicyPage
          onBackToHome={() => navigateTo('home')}
        />
      )}

      {currentView === 'accessibility' && (
        <AccessibilityPage
          onBackToHome={() => navigateTo('home')}
        />
      )}

      <Footer onNavigate={navigateTo} />

      {/* Wedding Film Player Modal */}
      {activeFilmStory && activeFilmStory.videoUrl && (
        <VideoModal
          videoUrl={activeFilmStory.videoUrl}
          posterUrl={activeFilmStory.videoPoster}
          title={activeFilmStory.title}
          isOpen={true}
          onClose={() => setActiveFilmStory(null)}
        />
      )}
    </div>
  );
}

export default App;
