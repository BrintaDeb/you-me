import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { faqs } from '../data/businessData';
import './FaqSection.css';

export const FaqSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="container">
        <div className="faq-header">
          <div className="eyebrow">
            <Sparkles size={14} /> Clarity &amp; Details
          </div>
          <h2 id="faq-heading" className="faq-title">
            Everything You Need to Know
          </h2>
          <p className="faq-subtitle">
            Authentic details on our documentary philosophy, destination travel, team structure, and how we deliver your memories.
          </p>
        </div>

        <div className="faq-accordion-list" role="region" aria-label="Frequently Asked Questions">
          {faqs.map(faq => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  id={`faq-btn-${faq.id}`}
                >
                  <span className="faq-question">{faq.question}</span>
                  <div className="faq-icon-badge" aria-hidden="true">
                    <ChevronDown size={18} />
                  </div>
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${faq.id}`}
                    className="faq-content"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
