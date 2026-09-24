import React, { useState, useRef } from 'react';
import {
  Heart,
  Wine,
  Gem,
  Users,
  Film,
  Camera,
  BookOpen,
  Sparkles,
  Check,
  ArrowRight,
  ChevronDown,
  Layers,
  MessageCircle
} from 'lucide-react';
import { DeckleBanner } from '../components/DeckleBanner';
import { businessInfo } from '../data/businessData';
import './CelebrationsPage.css';

interface DeliverableItem {
  icon: React.ReactNode;
  title: string;
  detail: string;
}

interface PackagePlan {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  tagline: string;
  badge?: string;
  deliverables: DeliverableItem[];
  moreDetails?: string[];
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
        priceNum: 94999,
        tagline: 'Both sides covered, beautifully and completely from pre-rituals to bidaai.',
        badge: 'Most Popular',
        deliverables: [
          {
            icon: <Users size={18} />,
            title: 'Bride & Groom Dedicated Teams',
            detail: 'Separate crews dedicated to both bride and groom celebrations simultaneously.'
          },
          {
            icon: <Film size={18} />,
            title: '4K Feature Cinema Film (12–15 Min)',
            detail: 'Teaser (60s) + Extended 12–15 minute narrative heirloom film with ambient sound.'
          },
          {
            icon: <Camera size={18} />,
            title: 'Candid & Traditional Mastery',
            detail: 'Uncapped high-resolution frames with custom Kodak/Fuji film emulation grading.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Centennial Lay-Flat Linen Album',
            detail: 'Handcrafted 12x18 lay-flat Italian linen album on 100% acid-free cotton paper.'
          },
          {
            icon: <Sparkles size={18} />,
            title: 'Aerial Drone Cinematography',
            detail: 'Cinematic aerial perspective of venue & synchronized soundscape of vows.'
          }
        ],
        moreDetails: [
          'High glossy finish on 20 sheets / 40 pages lay-flat album',
          '1-Day pre-wedding concept photo shoot (one theme, one scenic location)',
          'Complete raw file backup on cloud for 365 days',
          'Fast 21-day archival color-graded delivery'
        ]
      },
      {
        id: 'wedding-bandhan',
        name: 'BANDHAN CINEMA',
        price: '₹1,19,999',
        priceNum: 119999,
        tagline: 'The perfect balance of timeless ceremonial tradition and evocative cinema.',
        badge: 'Trending',
        deliverables: [
          {
            icon: <Users size={18} />,
            title: 'Dual Senior Storytellers',
            detail: 'Two senior candid photo directors with dedicated cinema motion operators.'
          },
          {
            icon: <Film size={18} />,
            title: 'Full Event Cinematic Video (1–2 Hr)',
            detail: 'Complete ceremony documentary film + 3 social reels + musical highlight teaser.'
          },
          {
            icon: <Camera size={18} />,
            title: '1-Day Pre-Wedding Motion Shoot',
            detail: 'Full-day outdoor conceptual shoot including motion teaser reel.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Dual Master Albums (12" × 18")',
            detail: 'Two 40-page high glossy embossed books for both families.'
          },
          {
            icon: <Sparkles size={18} />,
            title: '4K Drone & Master Audio Suite',
            detail: 'Dual-battery 4K drone cinematography & multi-mic sacred vow sound design.'
          }
        ],
        moreDetails: [
          'Exclusive e-invitation animated save-the-date teaser',
          'Custom wooden USB keepsake case with physical photo prints',
          'VIP private client lounge review & proofing',
          '18-day expedited archival delivery'
        ]
      },
      {
        id: 'wedding-parampara',
        name: 'PARAMPARA HERITAGE',
        price: '₹1,45,000',
        priceNum: 145000,
        tagline: 'Our signature multi-day bespoke visual chronicle for grand destination celebrations.',
        badge: 'Signature',
        deliverables: [
          {
            icon: <Users size={18} />,
            title: 'Lead Direction by Brinta Deb',
            detail: 'Personally directed by Creative Director Brinta Deb with senior motion team.'
          },
          {
            icon: <Film size={18} />,
            title: 'Cinema Trilogy Suite',
            detail: 'Instagram Reel Cut + 5-min Music Video + 25-minute Feature Documentary.'
          },
          {
            icon: <Camera size={18} />,
            title: 'Full-Day Destination Pre-Wedding Shoot',
            detail: 'Complimentary destination couple editorial shoot at exotic location prior to wedding.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Dual Leather Boxed Master Albums',
            detail: 'Two custom embossed NTR glossy glass-cover master albums with presentation boxes.'
          },
          {
            icon: <Sparkles size={18} />,
            title: 'Priority 14-Day Delivery',
            detail: 'VIP expedited master curation and private client lounge interactive proofing.'
          }
        ],
        moreDetails: [
          '2-Day pre-wedding video and editorial portraiture coverage',
          '3 Stylized cinematic reels crafted specifically for social milestones',
          'Personalized leather presentation case with engraved couple crest',
          'Direct creative planning sessions with Creative Director'
        ]
      },
      {
        id: 'wedding-mangalam',
        name: 'MANGALAM SIGNATURE',
        price: '₹1,79,999',
        priceNum: 179999,
        tagline: 'The pinnacle luxury experience — multi-camera feature cinema and master retouching.',
        badge: 'Grand Bespoke',
        deliverables: [
          {
            icon: <Users size={18} />,
            title: 'Master Atelier Crew & Director',
            detail: 'Full 8-member master crew with 3 dedicated candid cameras and dual cinema line FX.'
          },
          {
            icon: <Film size={18} />,
            title: 'Storytelling Feature Film (45m–1h)',
            detail: 'Cinema-grade narrative film with professional film score scoring and sound design.'
          },
          {
            icon: <Camera size={18} />,
            title: '3-Day Pre-Wedding Grand Tour',
            detail: 'Multi-location destination visual journey across scenic mountain or coastal terrains.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Two 70-Page Fine-Art Collector Books',
            detail: 'Feather-touch velvet paper albums with imported crystal glass covers and wooden boxes.'
          },
          {
            icon: <Sparkles size={18} />,
            title: 'Ultra VIP 10-Day Turnaround',
            detail: 'Top priority lab color development, raw footage master drive, and 5 bespoke reels.'
          }
        ],
        moreDetails: [
          '5 Ultra-high definition Instagram reels delivered within 72 hours of wedding',
          'Hardcover parents mini-album pair included',
          'Complete uncapped 14-bit RAW color-corrected photograph archive',
          'Zero travel or stay surcharges across entire Northeast India'
        ]
      }
    ]
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    icon: <Wine size={16} />,
    quote: '“Revisiting the vows, honoring the laughter, and capturing the golden years between.”',
    plans: [
      {
        id: 'anniv-rekindled',
        name: 'REKINDLED VOWS',
        price: '₹38,000',
        priceNum: 38000,
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
      },
      {
        id: 'anniv-silver',
        name: 'SILVER LEGACY',
        price: '₹65,000',
        priceNum: 65000,
        tagline: 'Multi-generational celebration chronicle for milestone 10th, 25th, or 50th jubilees.',
        deliverables: [
          {
            icon: <Users size={18} />,
            title: 'Full Family Gathering Coverage',
            detail: 'Gentle, natural-light portraiture of couple, children, and extended generations.'
          },
          {
            icon: <Film size={18} />,
            title: 'Documentary Milestone Film',
            detail: '10-minute commemorative film featuring family voiceovers and toast recordings.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Centennial Master Album',
            detail: 'Hardcover Italian leather folio preserving heirloom family milestones.'
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
        priceNum: 48000,
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
      },
      {
        id: 'engage-shubho',
        name: 'SHUBHO LAGNA',
        price: '₹72,000',
        priceNum: 72000,
        tagline: 'Full-day conceptual destination couple film and grand engagement gala.',
        deliverables: [
          {
            icon: <Camera size={18} />,
            title: 'Full-Day Destination Editorial',
            detail: 'Sunrise to twilight editorial shooting across multiple outfits and concepts.'
          },
          {
            icon: <Film size={18} />,
            title: '4K Cinematic Music Video',
            detail: '3–5 minute high-production musical film with cinema color grade.'
          },
          {
            icon: <BookOpen size={18} />,
            title: 'Embossed Guestbook Album',
            detail: 'Custom printed engagement photo guestbook for wedding attendees to sign.'
          }
        ]
      }
    ]
  }
];

export const CelebrationsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('wedding');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Comparator state (pick any two wedding plans)
  const weddingPlans = CELEBRATIONS_DATA[0].plans;
  const [comparePlanAId, setComparePlanAId] = useState<string>(weddingPlans[0].id);
  const [comparePlanBId, setComparePlanBId] = useState<string>(weddingPlans[2].id);

  const compareSectionRef = useRef<HTMLDivElement>(null);

  const currentCelebration = CELEBRATIONS_DATA.find((c) => c.id === activeCategory) || CELEBRATIONS_DATA[0];

  const planA = weddingPlans.find(p => p.id === comparePlanAId) || weddingPlans[0];
  const planB = weddingPlans.find(p => p.id === comparePlanBId) || weddingPlans[2];
  const priceDiff = Math.abs(planB.priceNum - planA.priceNum);
  const higherPlan = planB.priceNum >= planA.priceNum ? planB : planA;
  const lowerPlan = higherPlan === planB ? planA : planB;

  const scrollToCompare = () => {
    if (compareSectionRef.current) {
      compareSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleExploreMore = (planId: string) => {
    setExpandedPlanId(prev => prev === planId ? null : planId);
  };

  const totalCollections = CELEBRATIONS_DATA.reduce((acc, cat) => acc + cat.plans.length, 0);
  const minPriceNum = Math.min(...CELEBRATIONS_DATA.flatMap((cat) => cat.plans.map((p) => p.priceNum)));
  const minPriceFormatted = `₹${minPriceNum.toLocaleString('en-IN')}`;

  return (
    <main className="celebrations-page" id="main-content">
      {/* ── 1. Hero Header Section ──────────────────────────── */}
      <section className="cp-hero">
        <div className="cp-hero-inner">
          <p className="cp-hero-eyebrow">
            <span className="cp-eyebrow-line" aria-hidden="true" />
            YOU &amp; ME ATELIER &middot; COLLECTIONS &amp; PRICING
            <span className="cp-eyebrow-line" aria-hidden="true" />
          </p>

          <div className="cp-hero-title-block">
            <span className="cp-hero-prefix">Every love story,</span>
            <h1 className="cp-hero-title">PACKAGED BEAUTIFULLY</h1>
          </div>

          <p className="cp-hero-subtitle">
            <strong>{CELEBRATIONS_DATA.length}</strong> celebrations, <strong>{totalCollections}</strong> curated collections, starting at <strong>{minPriceFormatted}</strong>. Pick yours below &mdash; transparent investment with zero hidden surprises.
          </p>

          {/* Quick Celebration Jump Pills */}
          <div className="cp-hero-quick-pills" role="tablist" aria-label="Celebration jump pills">
            {CELEBRATIONS_DATA.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cp-quick-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Hero CTAs */}
          <div className="cp-hero-actions">
            <a
              href={businessInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cp-btn-primary"
            >
              <MessageCircle size={16} /> BOOK A CONSULTATION
            </a>
            <button
              type="button"
              className="cp-btn-secondary"
              onClick={scrollToCompare}
            >
              <Layers size={16} /> COMPARE SIDE BY SIDE
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Celebrations Section ─────────────────────────── */}
      <section className="cp-packages-section" id="packages">
        <div className="cp-container">
          <div className="cp-section-header">
            <span className="cp-section-prefix">Pick your</span>
            <h2 className="cp-section-title">CELEBRATION</h2>
          </div>

          {/* Category Tabs */}
          <div className="cp-category-tabs" role="tablist" aria-label="Celebration types">
            {CELEBRATIONS_DATA.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`cp-category-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="cp-tab-icon">{cat.icon}</span>
                  <span className="cp-tab-label">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Celebration Quote */}
          <p className="cp-celebration-quote" aria-live="polite">
            {currentCelebration.quote}
          </p>

          {/* Package Cards Grid */}
          <div className="cp-cards-grid">
            {currentCelebration.plans.map((plan) => {
              const isExpanded = expandedPlanId === plan.id;
              return (
                <article key={plan.id} className="cp-card viewfinder-card">
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

                  {/* Floating Circular Double-Ring Price Badge */}
                  <div className="cp-price-badge" aria-label={`Price: ${plan.price}`}>
                    <div className="cp-price-ring ring-1" aria-hidden="true" />
                    <div className="cp-price-ring ring-2" aria-hidden="true" />
                    <span className="cp-price-label">PRICE</span>
                    <span className="cp-price-amount">{plan.price}</span>
                  </div>

                  {/* Card Header */}
                  <div className="cp-card-header">
                    {plan.badge && <span className="cp-curatorial-badge">{plan.badge}</span>}
                    <h3 className="cp-card-title">{plan.name}</h3>
                    <p className="cp-card-tagline">{plan.tagline}</p>
                  </div>

                  {/* Deliverables List */}
                  <ul className="cp-deliverables-list">
                    {plan.deliverables.map((item, i) => (
                      <li key={i} className="cp-deliverable-item">
                        <span className="cp-deliverable-icon">{item.icon}</span>
                        <div className="cp-deliverable-text">
                          <strong className="cp-deliverable-title">{item.title}</strong>
                          <span className="cp-deliverable-detail">{item.detail}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Expandable Inclusions Drawer */}
                  {plan.moreDetails && (
                    <div className="cp-more-details-wrapper">
                      <button
                        type="button"
                        className="cp-explore-more-btn"
                        onClick={() => toggleExploreMore(plan.id)}
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? 'LESS DETAILS' : 'EXPLORE MORE INCLUSIONS'}</span>
                        <ChevronDown
                          size={15}
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.3s'
                          }}
                        />
                      </button>

                      {isExpanded && (
                        <ul className="cp-expanded-list">
                          {plan.moreDetails.map((detail, idx) => (
                            <li key={idx} className="cp-expanded-item">
                              <Check size={14} className="cp-check-icon" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="cp-card-actions">
                    <a
                      href={`https://wa.me/918119805161?text=Hello%20Team%20You%20%26%20Me%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(plan.name)}%20collection.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-card-book-btn"
                    >
                      BOOK NOW <ArrowRight size={15} />
                    </a>

                    {activeCategory === 'wedding' && (
                      <button
                        type="button"
                        className="cp-card-compare-btn"
                        onClick={() => {
                          setComparePlanAId(plan.id);
                          scrollToCompare();
                        }}
                      >
                        Compare with another collection &rarr;
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. Side by Side Comparison Tool ─────────────────── */}
      <section className="cp-compare-section" ref={compareSectionRef} id="compare">
        <div className="cp-container">
          <div className="cp-section-header">
            <span className="cp-section-prefix">Side by</span>
            <h2 className="cp-section-title">SIDE</h2>
            <p className="cp-section-subtitle">
              Pick any two <strong>wedding</strong> collections and see exactly where your investment goes.
            </p>
          </div>

          {/* Comparator Plan Selectors */}
          <div className="cp-comparator-selectors">
            <div className="cp-selector-group">
              <span className="cp-selector-label">Option One:</span>
              <div className="cp-selector-pills">
                {weddingPlans.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`cp-selector-pill ${comparePlanAId === p.id ? 'active' : ''}`}
                    onClick={() => setComparePlanAId(p.id)}
                  >
                    {p.name} ({p.price})
                  </button>
                ))}
              </div>
            </div>

            <div className="cp-selector-group">
              <span className="cp-selector-label">Option Two:</span>
              <div className="cp-selector-pills">
                {weddingPlans.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`cp-selector-pill ${comparePlanBId === p.id ? 'active' : ''}`}
                    onClick={() => setComparePlanBId(p.id)}
                  >
                    {p.name} ({p.price})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* The Verdict Breakdown Card */}
          <div className="cp-verdict-card">
            <div className="cp-verdict-header">
              <span className="cp-verdict-badge">THE VERDICT</span>
              <h3 className="cp-verdict-title">
                {higherPlan.name} costs <strong>₹{priceDiff.toLocaleString('en-IN')}</strong> more than {lowerPlan.name}
              </h3>
              <p className="cp-verdict-subtitle">&mdash; here’s what that craft investment buys:</p>
            </div>

            <div className="cp-comparison-table-wrapper">
              <table className="cp-comparison-table">
                <thead>
                  <tr>
                    <th>Craft Inclusion</th>
                    <th>{planA.name} ({planA.price})</th>
                    <th>{planB.name} ({planB.price})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Lead Creative Direction</td>
                    <td>Senior Studio Directors</td>
                    <td>{planB.priceNum >= 145000 ? <strong>Brinta Deb Personally</strong> : 'Senior Studio Directors'}</td>
                  </tr>
                  <tr>
                    <td>Dedicated Dual Crews</td>
                    <td><Check size={16} className="cp-check-green" /> Bride &amp; Groom Simultaneous</td>
                    <td><Check size={16} className="cp-check-green" /> Bride &amp; Groom Simultaneous</td>
                  </tr>
                  <tr>
                    <td>Pre-Wedding Editorial Shoot</td>
                    <td>{planA.priceNum >= 119999 ? '1-Day Shoot Included' : '1-Day Concept Photo Shoot'}</td>
                    <td>{planB.priceNum >= 145000 ? <strong>Full-Day Destination Editorial Included</strong> : '1-Day Pre-Wedding Shoot'}</td>
                  </tr>
                  <tr>
                    <td>Cinema Film Style</td>
                    <td>4K Feature Film (12–15 Min)</td>
                    <td>{planB.priceNum >= 145000 ? '4K Cinema Trilogy (25m + Reel + Music)' : 'Full Event Cinematic Film'}</td>
                  </tr>
                  <tr>
                    <td>Aerial Drone Cinematography</td>
                    <td><Check size={16} className="cp-check-green" /> 4K Drone Included</td>
                    <td><Check size={16} className="cp-check-green" /> Multi-Battery 4K Drone Included</td>
                  </tr>
                  <tr>
                    <td>Centennial Archival Albums</td>
                    <td>1 Lay-Flat 12x18 Linen Album</td>
                    <td>{planB.priceNum >= 145000 ? <strong>2 Master Boxed Leather Albums</strong> : '2 Albums 12x18 High Glossy'}</td>
                  </tr>
                  <tr>
                    <td>Social Reels Suite</td>
                    <td>1 Cinematic Teaser</td>
                    <td>{planB.priceNum >= 119999 ? '3 Stylized Reels + Teaser' : '1 Teaser'}</td>
                  </tr>
                  <tr>
                    <td>Delivery Turnaround</td>
                    <td>21 Days Archival Grade</td>
                    <td>{planB.priceNum >= 145000 ? <strong>Expedited 14-Day VIP Turnaround</strong> : '18 Days Archival Grade'}</td>
                  </tr>
                  <tr>
                    <td>Book Collection</td>
                    <td>
                      <a
                        href={`https://wa.me/918119805161?text=Hello%20Team%20You%20%26%20Me%2C%20I%20would%20like%20to%20book%20the%20${encodeURIComponent(planA.name)}%20package.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cp-table-book-btn"
                      >
                        BOOK {planA.name}
                      </a>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/918119805161?text=Hello%20Team%20You%20%26%20Me%2C%20I%20would%20like%20to%20book%20the%20${encodeURIComponent(planB.name)}%20package.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cp-table-book-btn highlight"
                      >
                        BOOK {planB.name}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Deckle Torn Paper Quote Banner ───────────────── */}
      <DeckleBanner
        quote="Every love story deserves to be remembered, beautifully and forever."
        author="YOU & ME Atelier"
        variant="crimson"
      />

      {/* ── 5. Trust Guarantee & FAQ Note ────────────────────── */}
      <section className="cp-trust-section">
        <div className="cp-container">
          <div className="cp-trust-box">
            <h3 className="cp-trust-title">✦ The Atelier Archival Guarantee</h3>
            <p className="cp-trust-desc">
              All commissioned collections include 14-bit RAW backup, museum-grade centennial color grading, and zero travel surcharges across Tripura. Custom destination wedding itineraries are tailored individually.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Bottom Call to Action ────────────────────────── */}
      <section className="cp-cta-banner">
        <div className="cp-cta-inner">
          <p className="cp-cta-label">Ready when you are</p>
          <h2 className="cp-cta-heading">Ready to Script Your Celebration?</h2>
          <div className="cp-cta-actions">
            <a
              href={businessInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cp-btn-primary"
            >
              <MessageCircle size={16} /> CHECK YOUR DATE VIA WHATSAPP
            </a>
            <a
              href="/portfolio"
              className="cp-btn-secondary"
            >
              EXPLORE OUR STORIES
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
