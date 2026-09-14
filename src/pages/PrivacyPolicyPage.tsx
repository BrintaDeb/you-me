import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { businessInfo } from '../data/businessData';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToHome }) => {
  return (
    <main className="container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '840px' }} id="main-content">
      <button
        type="button"
        onClick={onBackToHome}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 32 }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Mandatory Notice */}
      <div style={{
        background: 'rgba(200, 164, 107, 0.08)',
        border: '1px solid var(--accent-gold)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '40px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <ShieldAlert size={24} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h4 style={{ color: 'var(--accent-gold-light)', marginBottom: 6, fontSize: '1rem', fontWeight: 600 }}>
            NOTICE: DRAFT PRIVACY POLICY — CLIENT / LEGAL REVIEW REQUIRED
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This draft document has been prepared based solely on the actual, observed data collection practices of this commercial website (specifically enquiry contact submissions). The legacy Wix website contained default template instructional copy which has been quarantined. This policy must be formally reviewed and approved by the client and legal counsel prior to formal commercial launch.
          </p>
        </div>
      </div>

      <h1 style={{ fontSize: '2.8rem', marginBottom: '16px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Effective Date: September 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <section>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '12px' }}>1. Information We Collect</h2>
          <p>
            When you interact with <strong>YOU &amp; ME</strong> through our website (specifically our date availability and enquiry forms), we collect information that you voluntarily provide to us:
          </p>
          <ul style={{ paddingLeft: '24px', marginTop: '10px' }}>
            <li>Your Name (and partner&apos;s name)</li>
            <li>Email address</li>
            <li>Telephone / WhatsApp contact number</li>
            <li>Event date and event venue or location</li>
            <li>Information regarding your ceremony vision and referral source</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '12px' }}>2. How We Use Your Information</h2>
          <p>
            We use the personal information collected exclusively to:
          </p>
          <ul style={{ paddingLeft: '24px', marginTop: '10px' }}>
            <li>Respond to your booking enquiries and verify date availability.</li>
            <li>Prepare customized wedding photography proposals and service contracts.</li>
            <li>Communicate with you regarding logistical coordination for scheduled wedding shoots.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '12px' }}>3. Data Storage &amp; Security</h2>
          <p>
            We take reasonable technical precautions to safeguard the personal information submitted through our site against unauthorized access or disclosure. We do not sell, rent, or trade your personal contact details to any third-party marketing companies.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '12px' }}>4. Your Rights &amp; Contact Information</h2>
          <p>
            If you wish to review, update, or request the deletion of any contact information you have previously submitted to us, please contact us directly:
          </p>
          <div style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <p><strong>YOU &amp; ME</strong></p>
            <p>Email: <a href={`mailto:${businessInfo.email}`} style={{ color: 'var(--accent-gold)' }}>{businessInfo.email}</a></p>
            <p>Telephone: <a href={`tel:${businessInfo.phoneRaw}`} style={{ color: 'var(--accent-gold)' }}>{businessInfo.phone}</a></p>
          </div>
        </section>
      </div>
    </main>
  );
};
