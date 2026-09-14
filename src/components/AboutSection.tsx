import React from 'react';
import { Sparkles, Camera } from 'lucide-react';
import { businessInfo } from '../data/businessData';
import './AboutSection.css';

export const AboutSection: React.FC = () => {
  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <div className="eyebrow">
              <Sparkles size={14} /> Team You &amp; Me
            </div>

            <h2 id="about-heading" className="about-title">
              {businessInfo.about.title}
            </h2>

            {businessInfo.about.paragraphs.map((para, i) => (
              <p key={i} className="about-p">
                {para}
              </p>
            ))}

            <div className="about-highlight-box">
              <Camera size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
              {businessInfo.about.highlight}
            </div>

            <div style={{ marginTop: '16px' }}>
              <a
                href="#contact"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Your Conversation &rarr;
              </a>
            </div>
          </div>

          <div className="about-media-composition">
            <img
              src="/assets/brand/double_heart.png"
              alt=""
              className="about-heart-badge"
              aria-hidden="true"
            />
            <div className="about-frame-main">
              <img
                src="/assets/posters/ankita_subhadeep.jpg"
                alt="Documentary wedding couple portrait"
                loading="lazy"
              />
            </div>
            <div className="about-frame-secondary">
              <img
                src="/assets/posters/urmi_jasraj.jpg"
                alt="Intimate wedding moment"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
