import React from 'react';
import { AboutSection } from '../components/AboutSection';
import { EnquirySection } from '../components/EnquirySection';
import { FaqSection } from '../components/FaqSection';

export const AboutPage: React.FC = () => {
  return (
    <main style={{ paddingTop: 'var(--nav-height)' }} id="main-content">
      <AboutSection />
      <FaqSection />
      <EnquirySection />
    </main>
  );
};
