import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { businessInfo } from '../data/businessData';

interface AccessibilityPageProps {
  onBackToHome: () => void;
}

export const AccessibilityPage: React.FC<AccessibilityPageProps> = ({ onBackToHome }) => {
  return (
    <main className="container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '840px' }} id="main-content">
      <button
        type="button"
        onClick={onBackToHome}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 32 }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <h1 style={{ fontSize: '2.8rem', marginBottom: '16px' }}>Accessibility Statement</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Commitment to Digital Accessibility</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <section>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Our Commitment</h2>
          <p>
            <strong>YOU &amp; ME</strong> is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards to achieve conformance with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Measures Taken to Support Accessibility</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 4 }} />
              <span><strong>Keyboard Navigation:</strong> All navigation menus, galleries, modals, and enquiry forms are fully navigable using a keyboard with visible focus indicators.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 4 }} />
              <span><strong>Reduced Motion Support:</strong> The website respects the <code>prefers-reduced-motion</code> browser setting, replacing 3D camera transitions with immediate, stationary viewing modes.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 4 }} />
              <span><strong>High Contrast &amp; Hierarchy:</strong> Visual elements maintain sufficient contrast ratios for text readability against dark cinematic backgrounds.</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 4 }} />
              <span><strong>Accessible Form Controls:</strong> Input fields feature descriptive labels, explicit error associations (<code>aria-describedby</code>), and prevent automated focus traps.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Feedback &amp; Assistance</h2>
          <p>
            We welcome your feedback on the accessibility of the YOU &amp; ME website. If you encounter accessibility barriers, please let us know:
          </p>
          <div style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <p>Email: <a href={`mailto:${businessInfo.email}`} style={{ color: 'var(--accent-gold)' }}>{businessInfo.email}</a></p>
            <p>Phone: <a href={`tel:${businessInfo.phoneRaw}`} style={{ color: 'var(--accent-gold)' }}>{businessInfo.phone}</a></p>
          </div>
        </section>
      </div>
    </main>
  );
};
