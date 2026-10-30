import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="footer-section" id="contact" aria-label="Cafe Aesthetics Footer">
      {/* Subtle Ambient Radial Gold Glow */}
      <div className="footer-ambient-glow" aria-hidden="true" />

      {/* ===================================================================
          Top VIP Newsletter & Reservation Banner
          =================================================================== */}
      <div className="footer-newsletter-wrap">
        <div className="footer-container">
          <div className="footer-newsletter-card">
            <div className="newsletter-text-col">
              <span className="newsletter-eyebrow">
                <span className="newsletter-dot" aria-hidden="true" />
                THE ATELIER CLUB
              </span>
              <h3 className="newsletter-title">An Invitation to Exceptional Taste</h3>
              <p className="newsletter-desc">
                Subscribe for private tasting invitations, seasonal single-origin releases, and culinary stories.
              </p>
            </div>

            <div className="newsletter-form-col">
              {subscribed ? (
                <div className="newsletter-success" role="status">
                  <span className="newsletter-success-dot" aria-hidden="true" />
                  <span>Welcome to The Atelier. We look forward to welcoming you.</span>
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={handleSubscribe} aria-label="Newsletter Subscription">
                  <div className="newsletter-input-group">
                    <Mail className="newsletter-input-icon" size={18} aria-hidden="true" />
                    <input
                      type="email"
                      id="newsletter-email"
                      name="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="newsletter-input"
                      aria-label="Email address for newsletter"
                    />
                  </div>
                  <button type="submit" className="newsletter-submit-btn" aria-label="Join Atelier">
                    <span>JOIN</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          Main Multi-Column Footer Content
          =================================================================== */}
      <div className="footer-main-content">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1: Brand & Philosophy */}
            <div className="footer-col footer-col-brand">
              <a href="#home" className="footer-brand" aria-label="Cafe Aesthetics Home">
                <span className="footer-brand-dot" aria-hidden="true" />
                CAFE AESTHETICS
              </a>
              <p className="footer-brand-tagline">
                A sanctuary where slow pour-over rituals meet sensory mastery and contemporary culinary artistry.
              </p>

              <div className="footer-social-links" aria-label="Social Media Links">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Follow Cafe Aesthetics on Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Follow Cafe Aesthetics on Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Follow Cafe Aesthetics on X Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Subscribe to Cafe Aesthetics on YouTube"
                >
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Column 2: Navigation & Experiences */}
            <div className="footer-col">
              <h4 className="footer-col-title">EXPERIENCES</h4>
              <ul className="footer-link-list">
                <li><a href="#home" className="footer-nav-link">Pour-Over Coffee</a></li>
                <li><a href="#story" className="footer-nav-link">Our Story & Craft</a></li>
                <li><a href="#pizza" className="footer-nav-link">Wood-Fired Pizza</a></li>
                <li><a href="#menu" className="footer-nav-link">Featured Menu</a></li>
                <li><a href="#momos" className="footer-nav-link">Steamed Momos</a></li>
                <li><a href="#culinary-delights" className="footer-nav-link">Culinary Delights</a></li>
                <li><a href="#wagyu" className="footer-nav-link">Signature Wagyu</a></li>
              </ul>
            </div>

            {/* Column 3: Hours & Service */}
            <div className="footer-col">
              <h4 className="footer-col-title">HOURS OF SERVICE</h4>
              <ul className="footer-hours-list">
                <li className="hours-row">
                  <span className="hours-day">Monday — Thursday</span>
                  <span className="hours-time">07:30 — 22:00</span>
                </li>
                <li className="hours-row">
                  <span className="hours-day">Friday</span>
                  <span className="hours-time">07:30 — 23:00</span>
                </li>
                <li className="hours-row">
                  <span className="hours-day">Saturday</span>
                  <span className="hours-time">08:30 — 23:30</span>
                </li>
                <li className="hours-row">
                  <span className="hours-day">Sunday & Holidays</span>
                  <span className="hours-time">08:30 — 22:00</span>
                </li>
              </ul>
              <div className="footer-kitchen-note">
                <Clock size={14} className="kitchen-note-icon" aria-hidden="true" />
                <span>Kitchen orders conclude 45 minutes prior to closing.</span>
              </div>
            </div>

            {/* Column 4: Location & Concierge */}
            <div className="footer-col">
              <h4 className="footer-col-title">LOCATION & CONTACT</h4>
              <address className="footer-address">
                <div className="footer-contact-item">
                  <MapPin size={16} className="contact-icon" aria-hidden="true" />
                  <span>148 Amber Promenade, Bloomsbury, London WC1B 3DG</span>
                </div>
                <div className="footer-contact-item">
                  <Phone size={16} className="contact-icon" aria-hidden="true" />
                  <a href="tel:+442079460912" className="contact-link">+44 (0) 20 7946 0912</a>
                </div>
                <div className="footer-contact-item">
                  <Mail size={16} className="contact-icon" aria-hidden="true" />
                  <a href="mailto:concierge@cafeaesthetics.com" className="contact-link">concierge@cafeaesthetics.com</a>
                </div>
              </address>

              <div className="footer-reserve-cta">
                <a href="#reserve" className="footer-reserve-btn" id="footer-reserve-btn">
                  <span>RESERVE A TABLE</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          Bottom Legal & Copyright Bar
          ================================================================== */}
      <div className="footer-bottom-bar">
        <div className="footer-container footer-bottom-flex">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Cafe Aesthetics. All rights reserved. Crafted for slow living.
          </p>

          <div className="footer-legal-links">
            <a href="#privacy" className="legal-link">Privacy Policy</a>
            <span className="legal-sep" aria-hidden="true">·</span>
            <a href="#terms" className="legal-link">Terms of Service</a>
            <span className="legal-sep" aria-hidden="true">·</span>
            <a href="#cookies" className="legal-link">Cookie Preferences</a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="footer-back-to-top"
            aria-label="Back to top of page"
            id="back-to-top-btn"
          >
            <span>BACK TO TOP</span>
            <ArrowUp size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
