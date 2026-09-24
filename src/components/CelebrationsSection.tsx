import React, { useState } from 'react';
import { Users, Film, Camera, BookOpen, Sparkles, Check, ArrowRight, Heart, Wine, Gem } from 'lucide-react';
import { LetterFlipHeading } from './LetterFlipHeading';
import './CelebrationsSection.css';

interface PackagePlan {
  id: string;
  name: string;
  price: string;
  tagline: string;
  badge?: string;
  deliverables: {
    icon: React.ReactNode;
    title: string;
    detail: string;
  }[];
}

interface CelebrationCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  quote: string;
  plans: PackagePlan[];
}

const CELEBRATIONS_DATA: CelebrationCategory[] = [
  {
    id: 'wedding',
    label: 'Wedding',
    icon: <Heart size={16} />,
    quote: '“Two families, one sacred legacy — filmed with quiet intimacy and grandeur.”',
    plans: [
      {
        id: 'wedding-vivah',
        name: 'VIVAH ATELIER',
        price: '₹94,999',
        tagline: 'Complete two-side celebration coverage from pre-rituals to final bidaai.',
        badge: 'Most Popular',
        deliverables: [
          {
            icon: <Users size={18} />,
            title: 'Bride & Groom Dedicated Teams',
            detail: 'Separate crews dedicated to both bride and groom celebrations simultaneously.'
          },
          {
            icon: <Film size={18} />,
            title: '4K Feature Cinema Film',
            detail: 'Teaser (60s) + Extended 12–15 minute heirloom narrative film with ambient audio.'
          },
          {
            icon: <Camera size={18} />,
            title: 'Candid & Traditional Mastery',
            detail: 'Uncapped high-resolution frames with custom Kodak/Fuji film emulation grading.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Centennial Heirloom Album',
            detail: 'Handcrafted 12x18 lay-flat Italian linen album on 100% acid-free cotton paper.'
          },
          {
            icon: <Sparkles size={18} />,
            title: 'Aerial Drone & Sound Design',
            detail: 'Cinematic aerial perspective of venue & synchronized soundscape of vows.'
          }
        ]
      },
      {
        id: 'wedding-parampara',
        name: 'PARAMPARA HERITAGE',
        price: '₹1,45,000',
        tagline: 'Multi-day bespoke visual chronicle for grand destination and multi-event celebrations.',
        badge: 'Signature',
        deliverables: [
          {
            icon: <Users size={18} />,
            title: 'Lead Director & Master Crew',
            detail: 'Personally directed by Creative Director Brinta Deb with senior motion team.'
          },
          {
            icon: <Film size={18} />,
            title: 'Cinema Trilogy Suite',
            detail: 'Instagram Reel Cut + 5-min Music Video + 25-minute Feature Documentary.'
          },
          {
            icon: <Camera size={18} />,
            title: 'Pre-Wedding Atelier Included',
            detail: 'Complimentary full-day destination couple editorial shoot prior to celebration.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Dual Leather Boxed Albums',
            detail: 'Two custom embossed master albums for bride and groom family archives.'
          },
          {
            icon: <Sparkles size={18} />,
            title: 'Priority 14-Day Delivery',
            detail: 'VIP expedited master curation and private client lounge interactive proofing.'
          }
        ]
      }
    ]
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    icon: <Wine size={16} />,
    quote: '“Revisiting the vows, honoring the laughter, and capturing the years between.”',
    plans: [
      {
        id: 'anniv-milestone',
        name: 'REKINDLED VOWS',
        price: '₹38,000',
        tagline: 'Intimate celebration portraiture and emotional family storytelling.',
        deliverables: [
          {
            icon: <Camera size={18} />,
            title: 'Editorial Couple Session',
            detail: 'Golden hour outdoor or heritage architectural portrait session.'
          },
          {
            icon: <Film size={18} />,
            title: 'Retrospective Motion Reel',
            detail: 'Acoustic musical reel combining archive memories with present laughter.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Artisanal Coffee Table Book',
            detail: '30-page fine art commemorative book with embossed anniversary date.'
          }
        ]
      }
    ]
  },
  {
    id: 'engagement',
    label: 'Engagement',
    icon: <Gem size={16} />,
    quote: '“The quiet prologue to your forever — spontaneous, unposed, and electric.”',
    plans: [
      {
        id: 'engage-anurag',
        name: 'ANURAG PROLOGUE',
        price: '₹48,000',
        tagline: 'Ring ceremony festivities and breathtaking pre-wedding portraiture.',
        deliverables: [
          {
            icon: <Camera size={18} />,
            title: 'Pre-Wedding Location Shoot',
            detail: 'Half-day conceptual shoot at scenic outdoor or heritage location.'
          },
          {
            icon: <Film size={18} />,
            title: 'Cinematic Save-the-Date Teaser',
            detail: 'Stylized 4K short teaser for social invites and wedding announcements.'
          },
          {
            icon: <Users size={18} />,
            title: 'Ring Ceremony Documentary',
            detail: 'Unobtrusive coverage of family rituals, ring exchange, and candid emotions.'
          }
        ]
      }
    ]
  }
];

export interface CelebrationsSectionProps {
  onViewAllCelebrations?: () => void;
}

export const CelebrationsSection: React.FC<CelebrationsSectionProps> = ({ onViewAllCelebrations }) => {
  const [activeCategory, setActiveCategory] = useState<string>('wedding');
  const [showComparison, setShowComparison] = useState(false);

  const currentCelebration = CELEBRATIONS_DATA.find((c) => c.id === activeCategory) || CELEBRATIONS_DATA[0];

  return (
    <section className="celebrations-section" id="packages" aria-labelledby="celebrations-heading">
      <div className="container-wide">
        <div className="celebrations-header">
          <LetterFlipHeading
            prefix="Pick your"
            text="CELEBRATION"
            as="h2"
            align="center"
          />
          <p className="celebrations-subtitle">
            Every chapter of love deserves custom visual mastery. Transparent collections with zero hidden surprises.
          </p>
        </div>

        {/* Celebration Tabs */}
        <div className="celebration-tabs" role="tablist" aria-label="Celebration types">
          {CELEBRATIONS_DATA.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`celebration-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="celebration-tab-icon">{cat.icon}</span>
                <span className="celebration-tab-label">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Category Quote */}
        <p className="celebration-quote" aria-live="polite">
          {currentCelebration.quote}
        </p>

        {/* Package Plans Grid */}
        <div className="package-cards-grid">
          {currentCelebration.plans.map((plan) => (
            <article key={plan.id} className="package-card viewfinder-card">
              {/* Camera Viewfinder Corner Marks */}
              <div className="corner-component" aria-hidden="true">
                <div className="corner-01" />
                <div className="corner-02" />
                <div className="corner-03" />
                <div className="corner-04" />
                <div className="corner-05" />
                <div className="corner-06" />
                <div className="corner-07" />
                <div className="corner-08" />
              </div>

              {/* Floating Double-Border Price Badge (Golden Moment Signature) */}
              <div className="floating-price-badge" aria-label={`Price: ${plan.price}`}>
                <div className="price-badge-ring ring-1" aria-hidden="true" />
                <div className="price-badge-ring ring-2" aria-hidden="true" />
                <span className="price-badge-label">Investment</span>
                <span className="price-badge-amount">{plan.price}</span>
              </div>

              {/* Card Header */}
              <div className="package-card-header">
                {plan.badge && <span className="package-curatorial-badge">{plan.badge}</span>}
                <h3 className="package-card-title">{plan.name}</h3>
                <p className="package-card-tagline">{plan.tagline}</p>
              </div>

              {/* Deliverables List */}
              <ul className="package-deliverables-list">
                {plan.deliverables.map((item, i) => (
                  <li key={i} className="package-deliverable-item">
                    <span className="deliverable-icon">{item.icon}</span>
                    <div className="deliverable-text">
                      <strong className="deliverable-title">{item.title}</strong>
                      <span className="deliverable-detail">{item.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Card Actions */}
              <div className="package-card-actions">
                <a
                  href={`https://wa.me/918119805161?text=Hello%20Team%20You%20%26%20Me%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(plan.name)}%20collection.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary package-book-btn"
                >
                  Book a Consultation <ArrowRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Compare / Trust Note */}
        <div className="celebrations-footer-note">
          <p className="guarantee-text">
            ✦ All atelier packages include raw file backup, centennial archival color science, and zero travel surcharge across Tripura.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href="/celebrations"
              className="btn btn-primary"
              style={{
                borderRadius: '40px',
                padding: '10px 22px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={(e) => {
                if (onViewAllCelebrations) {
                  e.preventDefault();
                  onViewAllCelebrations();
                }
              }}
            >
              Explore Full Celebrations Page &rarr;
            </a>
            <button
              type="button"
              className="compare-toggle-btn"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Hide Side-by-Side Comparison' : 'Compare Collections Side by Side'}
            </button>
          </div>
        </div>

        {/* Side by Side Comparative Matrix Drawer */}
        {showComparison && (
          <div className="comparison-drawer" aria-label="Collections comparative matrix">
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Feature / Craft Inclusion</th>
                    <th>VIVAH ATELIER (₹94,999)</th>
                    <th>PARAMPARA HERITAGE (₹1,45,000)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Lead Creative Direction</td>
                    <td>Senior Studio Directors</td>
                    <td><strong>Brinta Deb Personally</strong></td>
                  </tr>
                  <tr>
                    <td>Dual Bride &amp; Groom Crews</td>
                    <td><Check size={16} className="check-icon" /> Included</td>
                    <td><Check size={16} className="check-icon" /> Included</td>
                  </tr>
                  <tr>
                    <td>Pre-Wedding Atelier Shoot</td>
                    <td>Optional Add-on</td>
                    <td><Check size={16} className="check-icon" /> Full Day Destination Included</td>
                  </tr>
                  <tr>
                    <td>Cinema Film Coverage</td>
                    <td>4K Feature Film (12-15m)</td>
                    <td>4K Extended Trilogy (25m + Reel + Music)</td>
                  </tr>
                  <tr>
                    <td>Aerial Drone Cinematography</td>
                    <td><Check size={16} className="check-icon" /> Included</td>
                    <td><Check size={16} className="check-icon" /> Multi-battery Cinema Drone</td>
                  </tr>
                  <tr>
                    <td>Archival Fine-Art Album</td>
                    <td>1 Lay-Flat 12x18 Linen Book</td>
                    <td>2 Master Boxed Italian Leather Albums</td>
                  </tr>
                  <tr>
                    <td>Delivery Turnaround</td>
                    <td>21 Days Archival Grade</td>
                    <td><strong>Expedited 14-Day VIP Delivery</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
