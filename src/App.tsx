import { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { MobileMenu } from './components/MobileMenu';
import { Footer } from './components/Footer';
import { CameraPathExperience } from './components/CameraPathExperience';
import { AboutSection } from './components/AboutSection';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { WeddingFilmsSection } from './components/WeddingFilmsSection';
import { FaqSection } from './components/FaqSection';
import { EnquirySection } from './components/EnquirySection';
import { couplesData, getStoryBySlug } from './data/couplesData';
import type { WeddingStory } from './data/couplesData';
import { audioAtmosphere } from './utils/audioAtmosphere';
import { HeartCursor } from './components/HeartCursor';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

// Route code-splitting: isolate heavy dependencies (jszip, rich lounges, modals) to demand
const PortfolioPage = lazy(() => import('./pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const StoryGalleryPage = lazy(() => import('./pages/StoryGalleryPage').then(m => ({ default: m.StoryGalleryPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage').then(m => ({ default: m.AccessibilityPage })));
const ClientLoungePage = lazy(() => import('./pages/ClientLoungePage').then(m => ({ default: m.ClientLoungePage })));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage').then(m => ({ default: m.AdminPanelPage })));
const VideoModal = lazy(() => import('./components/VideoModal').then(m => ({ default: m.VideoModal })));

const RouteLoadingFallback = () => (
  <div
    style={{
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--accent-gold)'
    }}
    aria-label="Loading page"
  >
    <div
      style={{
        width: 38,
        height: 38,
        border: '2px solid rgba(212, 175, 55, 0.2)',
        borderTopColor: '#D4AF37',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}
    />
    <span
      style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: '0.9rem',
        letterSpacing: '0.12em',
        color: 'var(--text-muted)'
      }}
    >
      YOU &amp; ME
    </span>
  </div>
);

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'portfolio' | 'story' | 'about' | 'privacy' | 'accessibility' | 'client-lounge' | 'admin'>('home');
  const [selectedStory, setSelectedStory] = useState<WeddingStory | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilmStory, setActiveFilmStory] = useState<WeddingStory | null>(null);

  // Native View Transition Helper
  const transitionView = (updateFn: () => void) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(updateFn);
    } else {
      updateFn();
    }
  };

  // Sync background music ducking when modal video plays
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
        const found = getStoryBySlug(slug);
        if (found) {
          setSelectedStory(found);
          setCurrentView('story');
        } else {
          setCurrentView('portfolio');
        }
      } else if (pathname === '/about' || pathname === '/contact') {
        setCurrentView('about');
        setSelectedStory(null);
      } else if (pathname === '/client-lounge') {
        setCurrentView('client-lounge');
        setSelectedStory(null);
      } else if (
        pathname === '/admin' ||
        pathname === '/admin-portal' ||
        pathname === '/admin-login' ||
        pathname === '/portal' ||
        new URLSearchParams(window.location.search).get('admin') === 'true' ||
        window.location.hash.toLowerCase() === '#admin'
      ) {
        setCurrentView('admin');
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
          try {
            const legacyPath = new URL(c.legacyUrl).pathname.toLowerCase();
            return legacyPath === pathname;
          } catch {
            return c.legacyUrl.toLowerCase().endsWith(pathname);
          }
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
      document.title = 'About Us & Team | YOU & ME Wedding Photography';
    } else if (currentView === 'client-lounge') {
      document.title = 'VIP Client Lounge & Album Curation | YOU & ME';
    } else if (currentView === 'admin') {
      document.title = 'Studio Admin Suite | YOU & ME';
    } else if (currentView === 'privacy') {
      document.title = 'Privacy Policy | YOU & ME';
    } else if (currentView === 'accessibility') {
      document.title = 'Accessibility Statement | YOU & ME';
    } else {
      document.title = 'YOU & ME — Cinematic Wedding Photography';
    }
  }, [currentView, selectedStory]);

  const navigateTo = (view: string, slug?: string) => {
    transitionView(() => {
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
      } else if (view === 'client-lounge') {
        setCurrentView('client-lounge');
        setSelectedStory(null);
        window.history.pushState(null, '', '/client-lounge');
      } else if (view === 'admin') {
        setCurrentView('admin');
        setSelectedStory(null);
        window.history.pushState(null, '', '/admin');
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
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStory = (story: WeddingStory) => {
    transitionView(() => {
      setSelectedStory(story);
      setCurrentView('story');
      window.history.pushState(null, '', `/portfolio/${story.slug}`);
    });
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

      <Suspense fallback={<RouteLoadingFallback />}>
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

        {currentView === 'client-lounge' && (
          <ClientLoungePage
            onBackToHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanelPage
            onBackToHome={() => navigateTo('home')}
            onNavigateToClientLounge={(pin) => {
              if (pin) {
                window.history.pushState(null, '', `/client-lounge?pin=${encodeURIComponent(pin)}`);
              }
              navigateTo('client-lounge');
            }}
          />
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
      </Suspense>

      <Footer onNavigate={navigateTo} />

      {/* PWA Install Prompt for Mobile & Desktop */}
      <PwaInstallPrompt />
    </div>
  );
}

export default App;
