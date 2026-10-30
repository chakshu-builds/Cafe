import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'HOME', href: '#home' },
  { label: 'OUR STORY', href: '#story' },
  { label: 'MENU', href: '#menu' },
  { label: 'CONTACT', href: '#contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Add subtle background once scrolled past 40px
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`navbar-container ${isScrolled ? 'scrolled' : ''}`}
        id="main-navbar"
      >
        <div className="navbar-content">
          {/* Brand Wordmark */}
          <a href="#home" className="brand-wordmark" aria-label="Cafe Aesthetics Home">
            <span className="brand-dot" aria-hidden="true"></span>
            CAFE AESTHETICS
          </a>

          {/* Center Navigation Links (Desktop) */}
          <nav className="nav-navigation" aria-label="Main Navigation">
            <ul className="nav-links-desktop">
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="nav-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Action (Desktop) */}
          <div className="nav-actions-wrap">
            <a href="#reserve" className="nav-action-desktop" id="reserve-btn">
              <span>RESERVE A TABLE</span>
              <ArrowUpRight className="nav-action-icon" aria-hidden="true" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMobileMenuOpen}
        id="mobile-drawer"
      >
        <ul className="mobile-nav-links">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#reserve"
          className="mobile-nav-action"
          onClick={closeMobileMenu}
          id="mobile-reserve-btn"
        >
          <span>RESERVE A TABLE</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
