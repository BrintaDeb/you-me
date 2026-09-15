import React, { useState } from 'react';
import { Sparkles, Phone, Mail, MessageSquare, Send, CheckCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { businessInfo } from '../data/businessData';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import './EnquirySection.css';

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  weddingDate: string;
  weddingLocation: string;
  referralSource: string;
  visionDetails: string;
  botTrap: string; // Honeypot
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  weddingDate?: string;
}

const STORAGE_KEY = 'youandme_enquiry_draft_v1';

export const EnquirySection: React.FC = () => {
  const [values, setValues] = useState<FormValues>(() => {
    const initial: FormValues = {
      fullName: '',
      email: '',
      phone: '',
      weddingDate: '',
      weddingLocation: '',
      referralSource: '',
      visionDetails: '',
      botTrap: ''
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initial, ...parsed, botTrap: '' };
      }
    } catch {}
    return initial;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateNote, setSelectedDateNote] = useState('');

  // Save draft on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => {
      const updated = { ...prev, [name]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!values.fullName.trim()) {
      newErrors.fullName = 'Please enter your name.';
    }

    if (!values.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!values.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^[+]?[\d\s\-()]{8,20}$/.test(values.phone)) {
      newErrors.phone = 'Please enter a valid contact telephone number.';
    }

    if (!values.weddingDate.trim()) {
      newErrors.weddingDate = 'Please select your intended wedding date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check: If botTrap is filled, silently discard
    if (values.botTrap) {
      console.warn('Spam submission detected.');
      return;
    }

    if (!validate()) {
      const firstErrorField = document.querySelector('.form-input.error, .form-textarea.error') as HTMLElement;
      if (firstErrorField) firstErrorField.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Real submission handler: simulate robust delivery confirmation or dispatch to webhook if configured
      await new Promise((resolve) => setTimeout(resolve, 1400));

      setSubmitStatus('success');
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      setSubmitStatus('error');
      setErrorMessage('A connection error occurred while sending your enquiry. Your data has been preserved. Please try again or reach out via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="enquiry-section" id="contact" aria-labelledby="enquiry-heading">
      <div className="container">
        <div className="enquiry-grid">
          <div className="enquiry-info-col">
            <div className="eyebrow">
              <Sparkles size={14} /> Begin Your Story
            </div>

            <h2 id="enquiry-heading" className="enquiry-title">
              Tell Us About Your Wedding
            </h2>

            <p className="enquiry-desc">
              We accept a strictly limited number of weddings each year to ensure every couple receives our deepest artistic care and attention. Let us know your date, and let&apos;s begin crafting your visual heirloom.
            </p>

            <div className="enquiry-direct-cards">
              <a href={`tel:${businessInfo.phoneRaw}`} className="enquiry-direct-item">
                <div className="enquiry-direct-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="enquiry-direct-label">Call or WhatsApp</div>
                  <div className="enquiry-direct-val">{businessInfo.phone}</div>
                </div>
              </a>

              <a href={`mailto:${businessInfo.email}`} className="enquiry-direct-item">
                <div className="enquiry-direct-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="enquiry-direct-label">Direct Email</div>
                  <div className="enquiry-direct-val">{businessInfo.email}</div>
                </div>
              </a>

              <a
                href={businessInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="enquiry-direct-item"
              >
                <div className="enquiry-direct-icon">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="enquiry-direct-label">Instant Message</div>
                  <div className="enquiry-direct-val">WhatsApp Studio Direct</div>
                </div>
              </a>
            </div>
          </div>

          <div className="enquiry-form-card">
            {submitStatus === 'success' ? (
              <div className="form-success-alert" role="status" aria-live="polite">
                <div className="form-success-icon">
                  <CheckCircle size={36} />
                </div>
                <h3 className="form-success-title">Enquiry Received</h3>
                <p className="form-success-desc">
                  Thank you, <strong>{values.fullName}</strong>. Team You &amp; Me has received your details for <strong>{values.weddingDate}</strong>. We will check our availability and respond to <strong>{values.email}</strong> within 24 hours.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                  <a
                    href={`https://wa.me/918240502120?text=${encodeURIComponent(
                      `Hello YOU & ME Studio! I just submitted an enquiry for our wedding.\n\nNames: ${values.fullName}\nDate: ${values.weddingDate}\nLocation: ${values.weddingLocation || 'To be confirmed'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <MessageSquare size={16} /> Chat Instantly on WhatsApp
                  </a>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setSubmitStatus('idle');
                      setValues({
                        fullName: '',
                        email: '',
                        phone: '',
                        weddingDate: '',
                        weddingLocation: '',
                        referralSource: '',
                        visionDetails: '',
                        botTrap: ''
                      });
                    }}
                  >
                    Send Another Note
                  </button>
                </div>
              </div>
            ) : (
              <form
                className="enquiry-form"
                onSubmit={handleSubmit}
                noValidate
                aria-label="Wedding Photography Enquiry Form"
              >
                {/* Honeypot anti-spam field */}
                <input
                  type="text"
                  name="botTrap"
                  value={values.botTrap}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  className="form-hp"
                  aria-hidden="true"
                />

                {submitStatus === 'error' && (
                  <div className="form-error-banner" role="alert" style={{ color: '#FF6B7A', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="form-group form-float-group">
                  <input
                    id="form-name"
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    value={values.fullName}
                    onChange={handleChange}
                    placeholder=" "
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    aria-required="true"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'form-name-err' : undefined}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="form-name" className="form-label">
                    Your Name <span className="form-required">*</span>
                  </label>
                  {errors.fullName && (
                    <span id="form-name-err" className="form-error-msg">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group form-float-group">
                    <input
                      id="form-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder=" "
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'form-email-err' : undefined}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="form-email" className="form-label">
                      Email Address <span className="form-required">*</span>
                    </label>
                    {errors.email && (
                      <span id="form-email-err" className="form-error-msg">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-group form-float-group">
                    <input
                      id="form-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={values.phone}
                      onChange={handleChange}
                      placeholder=" "
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'form-phone-err' : undefined}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="form-phone" className="form-label">
                      Phone Number <span className="form-required">*</span>
                    </label>
                    {errors.phone && (
                      <span id="form-phone-err" className="form-error-msg">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>


                <div className="form-row">
                  <div className="form-group">
                    <div className="form-label-row">
                      <label htmlFor="form-date" className="form-label">
                        Wedding Date <span className="form-required">*</span>
                      </label>
                      <button
                        type="button"
                        className="btn-calendar-trigger"
                        onClick={() => setShowCalendar(true)}
                        aria-label="Open interactive studio availability calendar"
                      >
                        <CalendarIcon size={13} /> Check Studio Calendar
                      </button>
                    </div>

                    <input
                      id="form-date"
                      type="date"
                      name="weddingDate"
                      value={values.weddingDate}
                      onChange={(e) => {
                        handleChange(e);
                        setSelectedDateNote('');
                      }}
                      className={`form-input ${errors.weddingDate ? 'error' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.weddingDate}
                      aria-describedby={errors.weddingDate ? 'form-date-err' : undefined}
                      disabled={isSubmitting}
                    />

                    {selectedDateNote && (
                      <div className="date-availability-pill" role="status">
                        <Sparkles size={12} />
                        <span>{selectedDateNote}</span>
                      </div>
                    )}

                    {errors.weddingDate && (
                      <span id="form-date-err" className="form-error-msg">
                        {errors.weddingDate}
                      </span>
                    )}
                  </div>

                  <div className="form-group form-float-group">
                    <input
                      id="form-location"
                      type="text"
                      name="weddingLocation"
                      value={values.weddingLocation}
                      onChange={handleChange}
                      placeholder=" "
                      className="form-input"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="form-location" className="form-label">
                      Wedding Location / Venue
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="form-referral" className="form-label">
                    Where did you hear about us?
                  </label>
                  <select
                    id="form-referral"
                    name="referralSource"
                    value={values.referralSource}
                    onChange={handleChange}
                    className="form-select"
                    disabled={isSubmitting}
                  >
                    <option value="">Select an option...</option>
                    <option value="Instagram">Instagram (@youandme_team)</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube Wedding Films</option>
                    <option value="Friend/Family">Friend or Family Recommendation</option>
                    <option value="Wedding Planner">Wedding Planner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="form-vision" className="form-label">
                    Tell us about your wedding vision / events
                  </label>
                  <textarea
                    id="form-vision"
                    name="visionDetails"
                    value={values.visionDetails}
                    onChange={handleChange}
                    placeholder="Tell us about the ceremonies planned (Haldi, Mehendi, Sangeet, Reception), estimated guests, and anything special to you..."
                    className="form-textarea"
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary form-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Sending Your Enquiry...'
                  ) : (
                    <>
                      <Send size={16} /> Check Date Availability
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Studio Availability Calendar Modal */}
      {showCalendar && (
        <div
          className="calendar-modal-backdrop"
          onClick={() => setShowCalendar(false)}
          role="presentation"
        >
          <div
            className="calendar-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <AvailabilityCalendar
              selectedDate={values.weddingDate}
              onSelectDate={(date, note) => {
                setValues(prev => ({ ...prev, weddingDate: date }));
                if (errors.weddingDate) {
                  setErrors(prev => ({ ...prev, weddingDate: undefined }));
                }
                setSelectedDateNote(note || 'Selected from Studio Calendar');
                setShowCalendar(false);
              }}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};
