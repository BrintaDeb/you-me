# TEST REPORT & VERIFICATION MATRIX

**Project**: You & Me — Cinematic Wedding Photography Website Redesign  
**Date**: September 2026  
**Status**: Comprehensive QA and Testing Framework

---

## 1. Automated Checks Matrix

| Verification Type | Command / Method | Target / Criteria | Status |
|-------------------|------------------|-------------------|--------|
| **TypeScript Typecheck** | \`npm run typecheck\` (\`tsc --noEmit\`) | Zero type errors | Passing |
| **Lint & Syntax** | Code inspection & Vite build | Zero syntax errors or warnings | Passing |
| **Production Build** | \`npm run build\` | Clean production bundle generated | Passing |
| **Dev Server Preview** | \`npm run preview\` | Fast local preview served at localhost | Passing |

---

## 2. Interactive & Experience Verification

| Test Scenario | Inspection Criteria | Target Result | Status |
|---------------|---------------------|---------------|--------|
| **Camera-Path Forward Scroll** | Smooth multi-axis 3D perspective camera travel through frames | Seamless 60fps, no stutter or jumps | Verified |
| **Camera-Path Reverse Scroll** | Smooth reverse camera movement when scrolling upwards | No stuck pinning, no element blinking | Verified |
| **Rapid Scroll Stress Test** | Quick scrolling from top to bottom and back | Zero detached layers or layout shifts | Verified |
| **Mobile & Touch Navigation** | Viewport <= 768px touch interactions | No horizontal overflow, touch-friendly tap targets (>48px) | Verified |
| **prefers-reduced-motion** | CSS media query \`prefers-reduced-motion: reduce\` | Camera travel replaced by elegant linear opacity transitions | Verified |
| **Video Reel Modal** | Click to play 5 signature client wedding reels | Custom player opens, clean video stream, no autoplay audio | Verified |
| **Full Portfolio Inspection** | 23 couples accessible in filterable grid | All 23 cards display correct names, tags, and covers | Verified |
| **Individual Gallery Pages** | Route \`/portfolio/:slug\` for all 23 couples | All 26–29 images render with natural aspect ratios (no face crops) | Verified |
| **Accessible Lightbox** | Click any photo in individual gallery | Opens full-screen, Arrow Keys navigate, Escape key closes | Verified |
| **Contact Form Validation** | Submit empty form | Displays accessible inline errors for Name, Email, Phone, Date | Verified |
| **Contact Form Spam Protection** | Hidden honeypot field filled by bot | Submission silently ignored/trapped | Verified |
| **Contact Form Success State** | Submit valid details | Clear confirmation message and confetti feedback | Verified |
| **Direct Contact Links** | Phone, Email, WhatsApp, Socials | Correct destinations: \`youandmeagt@gmail.com\`, \`(+91) 81198 05161\` | Verified |
| **Legacy Wix 301 Redirects** | Accessing legacy \`/blank-*\` routes | Seamless routing to corresponding \`/portfolio/:slug\` page | Verified |

---

## 3. Web Vitals & Accessibility Standards

- **Cumulative Layout Shift (CLS)**: Target `< 0.05` via fixed aspect-ratio containers.
- **Largest Contentful Paint (LCP)**: Target `< 2.5s` via high-priority hero image preloading and lightweight fonts.
- **WCAG 2.1 AA Contrast**: High-contrast text tokens (`#F3E8DF` on `#090807` provides 15.8:1 contrast ratio, well above the 4.5:1 requirement).
- **Keyboard Trapping & ARIA**: Modals and mobile menu drawers trap focus while active and restore focus to trigger element on close.
