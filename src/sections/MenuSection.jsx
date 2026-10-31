import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menuData';

gsap.registerPlugin(ScrollTrigger);

/**
 * Japanese category calligraphy characters
 */
const getCategoryKanji = (category) => {
  switch (category) {
    case 'SIGNATURE':
      return '特別';
    case 'PIZZA':
      return '石窯';
    case 'COFFEE':
      return '珈琲';
    case 'COLD COFFEE':
      return '水出';
    case 'TEA':
      return '日本茶';
    case 'DESSERTS':
      return '甘味';
    default:
      return '名物';
  }
};

export default function MenuSection() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardsRef = useRef([]);
  const progressFillRef = useRef(null);
  const horizontalTweenRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeIndexRef = useRef(0);

  /**
   * Smoothly navigate to selected category on horizontal track
   */
  const handleCategoryClick = useCallback((categoryId) => {
    setActiveCategory(categoryId);

    if (categoryId === 'ALL') {
      if (window.innerWidth > 840) {
        const trigger = horizontalTweenRef.current?.scrollTrigger;
        if (trigger) {
          window.scrollTo({ top: trigger.start, behavior: 'smooth' });
        }
      } else if (trackRef.current) {
        trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
      return;
    }

    // Find the first item of this category
    const targetIdx = MENU_ITEMS.findIndex((item) => item.category === categoryId);
    if (targetIdx === -1) return;

    const targetCard = cardsRef.current[targetIdx];
    if (!targetCard) return;

    if (window.innerWidth > 840) {
      const trigger = horizontalTweenRef.current?.scrollTrigger;
      const track = trackRef.current;
      if (trigger && track) {
        const maxScrollDist = track.scrollWidth - window.innerWidth;
        const targetOffset = Math.max(0, targetCard.offsetLeft - (window.innerWidth > 1200 ? 160 : 80));
        const fraction = Math.min(1, Math.max(0, targetOffset / maxScrollDist));
        const targetScroll = trigger.start + fraction * (trigger.end - trigger.start);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    } else if (trackRef.current) {
      const targetOffset = targetCard.offsetLeft - 24;
      trackRef.current.scrollTo({ left: targetOffset, behavior: 'smooth' });
    }
  }, []);

  /**
   * GSAP ScrollTrigger Pinned Horizontal Scroll Setup
   */
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mm = gsap.matchMedia();

    // =========================================================================
    // DESKTOP & TABLET (> 840px): Cinematic Pinned Horizontal Scroll
    // =========================================================================
    mm.add('(min-width: 841px)', () => {
      if (prefersReducedMotion) return;

      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const getScrollDistance = () => track.scrollWidth - window.innerWidth;

      const horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 1, // Smooth, tuned scroll synchronization
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Update bottom progress bar
            if (progressFillRef.current) {
              progressFillRef.current.style.transform = `scaleX(${self.progress})`;
            }

            // Calculate active dish closest to focal point
            const totalDist = getScrollDistance();
            const currentScrollX = self.progress * totalDist;
            const focalPoint = currentScrollX + window.innerWidth * 0.45;

            let closestIdx = 0;
            let minDiff = Infinity;

            cardsRef.current.forEach((cardEl, idx) => {
              if (!cardEl) return;
              const cardCenter = cardEl.offsetLeft + cardEl.clientWidth / 2;
              const diff = Math.abs(cardCenter - focalPoint);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = idx;
              }
            });

            if (closestIdx !== activeIndexRef.current) {
              activeIndexRef.current = closestIdx;
              setCurrentIndex(closestIdx);
              const currentItem = MENU_ITEMS[closestIdx];
              if (currentItem?.category) {
                setActiveCategory(currentItem.category);
              }
            }
          },
        },
      });

      horizontalTweenRef.current = horizontalTween;

      // Subtle parallax & reveal for each circular dish item
      cardsRef.current.forEach((itemEl) => {
        if (!itemEl) return;
        const img = itemEl.querySelector('.menu-circle-image');
        const textElements = itemEl.querySelectorAll('.menu-circle-name, .menu-circle-desc, .menu-circle-price');

        if (img) {
          gsap.fromTo(
            img,
            { scale: 1 },
            {
              scale: 1.08,
              ease: 'none',
              scrollTrigger: {
                trigger: itemEl,
                containerAnimation: horizontalTween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            }
          );
        }

        if (textElements.length) {
          gsap.fromTo(
            textElements,
            { opacity: 0.45, y: 12 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.03,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: itemEl,
                containerAnimation: horizontalTween,
                start: 'left 92%',
                end: 'left 60%',
                scrub: true,
              },
            }
          );
        }
      });

      // Handle image load recalculations
      const handleImageLoad = () => {
        ScrollTrigger.refresh();
      };

      const imgs = track.querySelectorAll('img');
      imgs.forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', handleImageLoad, { once: true });
        }
      });

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(track);

      return () => {
        resizeObserver.disconnect();
        imgs.forEach((img) => img.removeEventListener('load', handleImageLoad));
      };
    });

    // =========================================================================
    // MOBILE (<= 840px): Touch-Friendly Horizontal Snapping
    // =========================================================================
    mm.add('(max-width: 840px)', () => {
      const track = trackRef.current;
      if (!track) return;

      const handleMobileScroll = () => {
        const scrollLeft = track.scrollLeft;
        const maxScroll = track.scrollWidth - track.clientWidth;
        const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

        if (progressFillRef.current) {
          progressFillRef.current.style.transform = `scaleX(${progress})`;
        }

        const focalPoint = scrollLeft + track.clientWidth * 0.5;
        let closestIdx = 0;
        let minDiff = Infinity;

        cardsRef.current.forEach((cardEl, idx) => {
          if (!cardEl) return;
          const cardCenter = cardEl.offsetLeft + cardEl.clientWidth / 2;
          const diff = Math.abs(cardCenter - focalPoint);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        if (closestIdx !== activeIndexRef.current) {
          activeIndexRef.current = closestIdx;
          setCurrentIndex(closestIdx);
          const currentItem = MENU_ITEMS[closestIdx];
          if (currentItem?.category) {
            setActiveCategory(currentItem.category);
          }
        }
      };

      track.addEventListener('scroll', handleMobileScroll, { passive: true });
      return () => {
        track.removeEventListener('scroll', handleMobileScroll);
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="menu-horizontal-section"
      id="menu"
      aria-label="Artisan Japanese Café Menu"
    >
      <div ref={viewportRef} className="menu-viewport-frame">
        {/* Subtle Ambient Radial Glow & Vignette */}
        <div className="menu-ambient-radial-glow" aria-hidden="true" />
        <div className="menu-vignette-overlay" aria-hidden="true" />

        {/* ===================================================================
            HUD / HEADER OVERLAY (Fixed at top of pinned frame)
            =================================================================== */}
        <header className="menu-hud-header">
          {/* Brand & Kicker */}
          <div className="menu-hud-brand">
            <span className="menu-hud-kicker">THE CAFE EXPERIENCE</span>
            <div className="menu-hud-title-row">
              <span className="menu-hud-kanji">品書き</span>
              <span className="menu-hud-divider">·</span>
              <span className="menu-hud-subtitle">33 Handcrafted Offerings</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <nav className="menu-hud-categories" aria-label="Menu categories">
            <div className="menu-hud-pills-track" role="tablist">
              {MENU_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`menu-hud-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <span className="hud-pill-text">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Live Position Counter */}
          <div className="menu-hud-counter" aria-live="polite">
            <span className="hud-counter-label">TASTING</span>
            <span className="hud-counter-digits">
              <strong className="hud-counter-current">{String(currentIndex + 1).padStart(2, '0')}</strong>
              <span className="hud-counter-slash">/</span>
              <span className="hud-counter-total">{String(MENU_ITEMS.length).padStart(2, '0')}</span>
            </span>
          </div>
        </header>

        {/* ===================================================================
            HORIZONTAL SCROLLING MENU TRACK (Pure Minimalist Circular Dishes)
            No square boxes. Elegant circular dishes with name, desc, and price below.
            =================================================================== */}
        <div ref={trackRef} className="menu-horizontal-track">
          {/* 1. Curated Prologue Title Card */}
          <div className="menu-intro-block">
            <span className="intro-block-kicker">CURATED SELECTION</span>
            <h2 className="intro-block-title">
              A Little Something <br />
              for Every <em>Craving</em>
            </h2>
            <p className="intro-block-desc">
              From your first coffee of the morning to the last bite of something sweet.
            </p>
            <div className="intro-block-hint">
              <span className="intro-hint-line" />
              <span className="intro-hint-text">SCROLL TO EXPLORE DISHES</span>
              <span className="intro-hint-arrow">→</span>
            </div>
          </div>

          {/* 2. All 33 Circular Dish Items */}
          {MENU_ITEMS.map((item, index) => {
            const kanji = getCategoryKanji(item.category);

            return (
              <div
                key={item.id}
                ref={(el) => (cardsRef.current[index] = el)}
                className={`menu-circle-item menu-cat-${item.category.toLowerCase().replace(/\s+/g, '-')}`}
                data-index={index}
                data-category={item.category}
              >
                {/* Subtle Decorative Numbering */}
                <span className="menu-circle-num">{String(index + 1).padStart(2, '0')}</span>

                {/* Circular Food / Beverage Image (Dish Presentation) */}
                <div className="menu-circle-image-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="menu-circle-image"
                    loading={index < 6 ? 'eager' : 'lazy'}
                    decoding="async"
                    width="300"
                    height="300"
                  />
                  <div className="menu-circle-image-ring" aria-hidden="true" />
                </div>

                {/* Compact Category Label */}
                <span className="menu-circle-category">
                  <span className="circle-category-kanji">{kanji}</span>
                  <span className="circle-category-text">{item.categoryLabel}</span>
                </span>

                {/* Elegant Item Name in Serif */}
                <h3 className="menu-circle-name">{item.name}</h3>

                {/* Muted Short Description */}
                <p className="menu-circle-desc">{item.description}</p>

                {/* Price normally underneath */}
                <span className="menu-circle-price">{item.price}</span>
              </div>
            );
          })}

          {/* 3. Exhibition Outro Block */}
          <div className="menu-outro-block">
            <span className="outro-block-kicker">THE JOURNEY DEEPENS</span>
            <h3 className="outro-block-title">
              Steamed Momos <br />
              &amp; <em>Robata Delights</em>
            </h3>
            <p className="outro-block-desc">
              Continue scrolling down to explore our Himalayan steamed momos and culinary showcases.
            </p>
            <div className="outro-block-arrow">
              <span>CONTINUE SCROLLING</span>
              <span className="outro-arrow-symbol">↓</span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            BOTTOM STATUS & HORIZONTAL PROGRESS BAR
            =================================================================== */}
        <div className="menu-hud-footer">
          <div className="menu-footer-hint">
            <span className="footer-hint-pulse" />
            <span className="footer-hint-text">VERTICAL SCROLL CONTROLS HORIZONTAL TASTINGS</span>
          </div>

          <div className="menu-progress-track" aria-hidden="true">
            <div ref={progressFillRef} className="menu-progress-bar-fill" />
          </div>
        </div>
      </div>
    </section>
  );
}
