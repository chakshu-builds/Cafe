import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, UtensilsCrossed } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * FOUR SIGNATURE DISHES
 * Attached around the perimeter of the black wooden serving platter.
 * Real, appetizing dishes with warm, natural descriptions:
 * 1. Pizza (0° top-centre)
 * 2. Momos (270° left -> turns +90° to top-centre)
 * 3. Coffee (180° bottom -> turns +180° to top-centre)
 * 4. Dessert (90° right -> turns +270° to top-centre)
 */
const DISHES = [
  {
    id: 'pizza',
    number: '01',
    category: 'PIZZA',
    label: 'PIZZA',
    name: 'Wild Mushroom & Truffle Pizza',
    kicker: 'WOOD-FIRED OVEN',
    badge: 'STONE BAKED',
    heroTag: "CHEF'S PICK",
    description: 'Handcrafted with the finest ingredients, for the perfect slice.',
    extendedDesc:
      'Crisp hand-stretched dough baked in our stone kiln, topped with sweet tomato sauce, melted fresh mozzarella, sautéed wild mushrooms, and a delicate drizzle of truffle oil.',
    price: '₹399',
    tags: ['Stone-Oven Baked', 'Fresh Mozzarella', 'Wild Mushrooms', 'Sweet Basil'],
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&h=800&q=90',
    alt: 'Fresh wood-fired artisan pizza with melted cheese, mushrooms, and fresh basil',
    accentColor: '#D45B5B',
    accentGlow: 'rgba(212, 91, 91, 0.45)',
    baseAngle: 0, // 12 o'clock (TOP-CENTRE)
    bgGradient:
      'radial-gradient(ellipse at 70% 60%, rgba(135, 24, 24, 0.48) 0%, rgba(48, 12, 16, 0.78) 45%, #0b0607 90%)',
  },
  {
    id: 'momos',
    number: '02',
    category: 'MOMOS',
    label: 'MOMOS',
    name: 'Steamed Himalayan Dumplings',
    kicker: 'STEAMED FRESH',
    badge: 'HOUSE FAVORITE',
    heroTag: 'BESTSELLER',
    description: 'Delicate parcels packed with bold flavours.',
    extendedDesc:
      'Hand-folded dumplings packed with finely minced fresh garden vegetables, crushed ginger, and aromatic mountain herbs. Steamed piping hot and served with our spicy chili dip.',
    price: '₹219',
    tags: ['Hand-Folded', 'Steamed Fresh', 'Spicy Chili Chutney', 'Fresh Herbs'],
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&h=800&q=90',
    alt: 'Hot freshly steamed dumplings served in traditional round bamboo steamer',
    accentColor: '#C68B59',
    accentGlow: 'rgba(198, 139, 89, 0.45)',
    baseAngle: 270, // 9 o'clock (LEFT) - rotates to 0° after +90°
    bgGradient:
      'radial-gradient(ellipse at 70% 60%, rgba(142, 88, 50, 0.48) 0%, rgba(48, 26, 15, 0.78) 45%, #0c0806 90%)',
  },
  {
    id: 'coffee',
    number: '03',
    category: 'COFFEE',
    label: 'COFFEE',
    name: 'Artisan Latte & Cold Brew',
    kicker: 'SPECIALTY ROAST',
    badge: '100% ARABICA',
    heroTag: "BARISTA'S CHOICE",
    description: 'Brewed to fuel good conversations and great moments.',
    extendedDesc:
      'Freshly ground specialty Arabica beans pulled for a velvety golden crema, poured with silky steamed microfoam and notes of roasted cocoa and hazelnut.',
    price: '₹199',
    tags: ['Specialty Arabica', 'Silky Microfoam', 'Velvety Crema', 'Dark Cocoa'],
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&h=800&q=90',
    alt: 'Freshly poured artisan latte with delicate latte art foam in dark ceramic cup',
    accentColor: '#5C89C7',
    accentGlow: 'rgba(92, 137, 199, 0.45)',
    baseAngle: 180, // 6 o'clock (BOTTOM) - rotates to 0° after +180°
    bgGradient:
      'radial-gradient(ellipse at 70% 60%, rgba(28, 52, 90, 0.52) 0%, rgba(12, 22, 42, 0.82) 45%, #050811 90%)',
  },
  {
    id: 'dessert',
    number: '04',
    category: 'DESSERT',
    label: 'DESSERT',
    name: 'Classic Espresso Tiramisu',
    kicker: 'FRESH PATISSERIE',
    badge: 'HOUSE MADE',
    heroTag: 'MUST TRY',
    description: 'A sweet ending to a perfect experience.',
    extendedDesc:
      'Soft Italian ladyfinger biscuits soaked in rich espresso, layered with light whipped mascarpone cream, and finished with a generous dusting of fine dark cocoa.',
    price: '₹249',
    tags: ['Fresh Mascarpone', 'Espresso Soak', 'Dark Cocoa Dust', 'House Recipe'],
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&h=800&q=90',
    alt: 'Decadent classic Italian tiramisu dessert dusted with rich cocoa powder',
    accentColor: '#68B884',
    accentGlow: 'rgba(104, 184, 132, 0.45)',
    baseAngle: 90, // 3 o'clock (RIGHT) - rotates to 0° after +270°
    bgGradient:
      'radial-gradient(ellipse at 70% 60%, rgba(28, 72, 46, 0.52) 0%, rgba(14, 34, 24, 0.82) 45%, #040d07 90%)',
  },
];

export default function CulinaryDelights() {
  const sectionRef = useRef(null);
  const platterRef = useRef(null);
  const counterRotateRefs = useRef([]);
  const bgLayersRef = useRef([]);
  const contentCardRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  /**
   * Smoothly jump to specific dish chapter
   */
  const jumpToDish = useCallback((index) => {
    setActiveIndex(index);
    activeIndexRef.current = index;

    const trigger = scrollTriggerRef.current;
    if (trigger && window.innerWidth > 840) {
      const targetFraction = index / (DISHES.length - 1);
      const targetScroll = trigger.start + targetFraction * (trigger.end - trigger.start);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else if (platterRef.current) {
      // Mobile or direct rotation fallback - snappy 0.45s response on touch screens
      const isMobile = window.innerWidth <= 840;
      const targetAngle = index * 90;
      gsap.to(platterRef.current, {
        rotation: targetAngle,
        duration: isMobile ? 0.45 : 0.85,
        ease: isMobile ? 'power2.out' : 'power3.out',
      });
      counterRotateRefs.current.forEach((el) => {
        if (el) {
          gsap.to(el, {
            rotation: -targetAngle,
            duration: isMobile ? 0.45 : 0.85,
            ease: isMobile ? 'power2.out' : 'power3.out',
          });
        }
      });
      // Cross-fade background layers
      bgLayersRef.current.forEach((layerEl, i) => {
        if (layerEl) {
          gsap.to(layerEl, {
            opacity: i === index ? 1 : 0,
            duration: isMobile ? 0.35 : 0.6,
          });
        }
      });
    }
  }, []);

  const handlePrev = useCallback(() => {
    const prev = Math.max(0, activeIndexRef.current - 1);
    jumpToDish(prev);
  }, [jumpToDish]);

  const handleNext = useCallback(() => {
    const next = Math.min(DISHES.length - 1, activeIndexRef.current + 1);
    jumpToDish(next);
  }, [jumpToDish]);

  const handleExploreMenu = useCallback(() => {
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  /**
   * Staggered text entrance when featured dish changes
   */
  useEffect(() => {
    if (!contentCardRef.current) return;
    const items = contentCardRef.current.querySelectorAll('.platter-anim-text');
    if (items.length) {
      gsap.fromTo(
        items,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.42, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [activeIndex]);

  /**
   * GSAP ScrollTrigger Pinned 3D Platter Carousel
   */
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mm = gsap.matchMedia();

    // =========================================================================
    // DESKTOP & TABLET (> 840px): Pinned Scroll-Driven Circular Turntable
    // =========================================================================
    mm.add('(min-width: 841px)', () => {
      if (prefersReducedMotion) return;

      const section = sectionRef.current;
      const platter = platterRef.current;
      if (!section || !platter) return;

      // Master rotation timeline: 0° to 270° clockwise across the 4 dishes
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          start: 'top top',
          end: '+=2400', // Generous runway for smooth, deliberate rotation
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress; // 0 to 1

            // Detect nearest active dish index (0: Pizza, 1: Momos, 2: Coffee, 3: Dessert)
            const raw = progress * 3;
            const nearest = Math.min(3, Math.max(0, Math.round(raw)));

            if (nearest !== activeIndexRef.current) {
              activeIndexRef.current = nearest;
              setActiveIndex(nearest);
            }

            // Cross-fade atmospheric background layers based on scroll progress
            bgLayersRef.current.forEach((layerEl, idx) => {
              if (!layerEl) return;
              const slidePos = idx / 3;
              const dist = Math.abs(progress - slidePos) * 3;
              const opacity = Math.max(0, Math.min(1, 1 - dist * 1.2));
              layerEl.style.opacity = opacity.toFixed(3);
            });
          },
        },
      });

      scrollTriggerRef.current = masterTL.scrollTrigger;

      // 1. Platter rotates clockwise from 0° to 270°
      masterTL.to(
        platter,
        {
          rotation: 270,
          ease: 'none',
        },
        0
      );

      // 2. All 4 food plates counter-rotate to keep food upright and mouth-watering
      counterRotateRefs.current.forEach((plateEl) => {
        if (plateEl) {
          masterTL.to(
            plateEl,
            {
              rotation: -270,
              ease: 'none',
            },
            0
          );
        }
      });

      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);

      return () => {
        clearTimeout(timer);
      };
    });

    // =========================================================================
    // MOBILE (<= 840px): Interactive Touch Turntable
    // =========================================================================
    mm.add('(max-width: 840px)', () => {
      bgLayersRef.current.forEach((layerEl, idx) => {
        if (layerEl) {
          layerEl.style.opacity = idx === 0 ? '1' : '0';
        }
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  const currentDish = DISHES[activeIndex] || DISHES[0];

  return (
    <section
      ref={sectionRef}
      className="culinary-platter-section"
      id="culinary-delights"
      aria-label="Signature Highlights — 3D Circular Food Carousel"
    >
      <div className="culinary-platter-frame">
        {/* ===================================================================
            ATMOSPHERIC BACKGROUND GRADIENTS (Crossfades per dish)
            =================================================================== */}
        <div className="culinary-background-stack" aria-hidden="true">
          {DISHES.map((dish, idx) => (
            <div
              key={dish.id}
              ref={(el) => (bgLayersRef.current[idx] = el)}
              className="culinary-bg-layer"
              style={{
                background: dish.bgGradient,
                opacity: idx === 0 ? 1 : 0,
              }}
            />
          ))}
          <div className="culinary-vignette-overlay" />
        </div>

        {/* ===================================================================
            TOP BAR HEADER
            =================================================================== */}
        <header className="culinary-hud-header">
          {/* Brand & Section Title */}
          <div className="culinary-hud-brand">
            <span className="culinary-hud-kicker">OUR SIGNATURE SELECTION</span>
            <div className="culinary-hud-title-row">
              <span className="culinary-hud-main">CULINARY DELIGHTS</span>
            </div>
          </div>

          {/* Category Tabs */}
          <nav className="culinary-hud-nav" aria-label="Menu categories">
            <div className="culinary-hud-tabs" role="tablist">
              {DISHES.map((dish, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={dish.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`culinary-hud-tab ${isActive ? 'active' : ''}`}
                    onClick={() => jumpToDish(idx)}
                    style={{
                      '--tab-accent': dish.accentColor,
                    }}
                  >
                    <span className="hud-tab-label">{dish.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Simple Clean Dish Counter */}
          <div className="culinary-hud-counter" aria-live="polite">
            <span className="culinary-counter-label">DISH</span>
            <div className="culinary-counter-digits">
              <strong className="culinary-counter-cur">{currentDish.number}</strong>
              <span className="culinary-counter-slash">/</span>
              <span className="culinary-counter-total">04</span>
            </div>
          </div>
        </header>

        {/* ===================================================================
            MAIN SHOWCASE STAGE:
            Left: Dynamic Dish Details
            Right: Rotating Black Wooden Serving Platter with 4 Dishes
            =================================================================== */}
        <div className="culinary-platter-stage">
          {/* 1. LEFT COLUMN: FEATURED DISH CONTENT (Streamlined Minimalist Layout) */}
          <div ref={contentCardRef} className="culinary-editorial-col">
            {/* Kicker badge */}
            <div className="editorial-kicker platter-anim-text">
              <span className="kicker-line" style={{ backgroundColor: currentDish.accentColor }} />
              <span className="kicker-text" style={{ color: currentDish.accentColor }}>
                {currentDish.category}
              </span>
              <span className="kicker-badge-tag">{currentDish.badge}</span>
            </div>

            {/* Dish Specific Name */}
            <h2 className="editorial-hero-title platter-anim-text">
              {currentDish.name}
            </h2>

            {/* Light, Crisp Info */}
            <p className="editorial-lead-desc platter-anim-text">
              {currentDish.description}
            </p>

            {/* Price & Explore Menu Button */}
            <div className="editorial-action-row platter-anim-text">
              <div className="editorial-price-wrap">
                <span className="price-lead-label">PRICE</span>
                <span className="price-bold-amount" style={{ color: currentDish.accentColor }}>
                  {currentDish.price}
                </span>
              </div>

              {/* Explore Menu Button */}
              <button
                type="button"
                className="platter-explore-btn"
                onClick={handleExploreMenu}
                style={{
                  '--btn-accent': currentDish.accentColor,
                  '--btn-glow': currentDish.accentGlow,
                }}
              >
                <span>EXPLORE FULL MENU</span>
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>

          {/* 2. RIGHT COLUMN: 3D BLACK WOODEN SERVING PLATTER */}
          <div className="culinary-platter-rig-wrapper">
            {/* Pure 2D Ambient Radial Shadow (Behind 3D Rig — Eliminates 3D clipping artifacts) */}
            <div className="platter-floor-shadow" aria-hidden="true" />

            <div className="culinary-platter-rig">
              {/* Giant Black Wooden Serving Platter */}
              <div
                ref={platterRef}
                className="black-wooden-platter"
                role="region"
                aria-label="Rotating wooden serving platter with 4 dishes"
              >
                {/* Wood Texture & Ring Accents */}
                <div className="platter-wood-texture" aria-hidden="true" />
                <div className="platter-rings-overlay" aria-hidden="true" />
                <div className="platter-rim-bevel" aria-hidden="true" />
                <div className="platter-brass-inlay-ring" aria-hidden="true" />

                {/* Center Antique Brass Hub Medallion */}
                <div className="platter-center-hub" aria-hidden="true">
                  <div className="hub-outer-ring">
                    <div className="hub-inner-plate">
                      <UtensilsCrossed size={22} color="#dfba8c" />
                    </div>
                  </div>
                </div>

                {/* FOUR CIRCULAR FOOD PLATES ATTACHED TO PLATTER CIRCUMFERENCE */}
                {DISHES.map((dish, idx) => {
                  const isFeatured = activeIndex === idx;

                  // Polar coordinates: 35% radius from center
                  // 0°: top, 90°: right, 180°: bottom, 270°: left
                  const angleRad = (dish.baseAngle * Math.PI) / 180;
                  const xPercent = 50 + 35 * Math.sin(angleRad);
                  const yPercent = 50 - 35 * Math.cos(angleRad);

                  return (
                    <div
                      key={dish.id}
                      className={`food-plate-anchor ${isFeatured ? 'is-featured-dish' : ''}`}
                      style={{
                        left: `${xPercent.toFixed(2)}%`,
                        top: `${yPercent.toFixed(2)}%`,
                        '--dish-accent': dish.accentColor,
                        '--dish-glow': dish.accentGlow,
                      }}
                      onClick={() => jumpToDish(idx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${dish.label}: ${dish.name}. Click to view.`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          jumpToDish(idx);
                        }
                      }}
                    >
                      {/* Counter-rotating plate to keep food upright */}
                      <div
                        ref={(el) => (counterRotateRefs.current[idx] = el)}
                        className="plate-counter-rotate"
                      >
                        {/* Featured Pill Badge (Chef's Pick / Bestseller / Must Try) */}
                        {isFeatured && (
                          <div className="plate-hero-badge" aria-hidden="true">
                            <Sparkles size={11} />
                            <span>{dish.heroTag}</span>
                          </div>
                        )}

                        {/* Ceramic Artisan Plate Dish */}
                        <div className="artisan-dish-plate">
                          <div className="plate-rim-highlight" aria-hidden="true" />
                          <img
                            src={dish.image}
                            alt={dish.alt}
                            className="plate-food-img"
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            width="800"
                            height="800"
                          />
                          <div className="plate-inner-vignette" aria-hidden="true" />
                        </div>

                        {/* Floating Dish Label Pill */}
                        <div className="plate-floating-label">
                          <span className="plate-label-number">{dish.number}</span>
                          <span className="plate-label-name">{dish.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            LUXURY ARTISANAL BOTTOM DOCK & TASTING NAVIGATION
            Banish the empty black void with an elegant, functional design
            =================================================================== */}
        <div className="culinary-bottom-dock">
          {/* Ambient floor glow that shifts color with the featured dish */}
          <div
            className="dock-ambient-glow"
            aria-hidden="true"
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${currentDish.accentGlow} 0%, transparent 70%)`,
            }}
          />

          {/* Top Brass Hairline Flourish */}
          <div className="dock-flourish-bar" aria-hidden="true">
            <span className="dock-hairline-line" />
            <div className="dock-flourish-badge">
              <span className="flourish-star">✦</span>
              <span className="flourish-text">SIGNATURE ROTATION</span>
              <span className="flourish-star">✦</span>
            </div>
            <span className="dock-hairline-line" />
          </div>

          {/* Bottom Dock Control & Metadata Row */}
          <div className="dock-inner-container">
            {/* Left Curated Accent Tag */}
            <div className="dock-craft-meta dock-meta-left">
              <span className="dock-meta-accent">CHEF'S CURATION</span>
              <span className="dock-meta-title">SLOW-CRAFTED FLAVOURS</span>
            </div>

            {/* Center: Interactive Glass Dish Navigation Pills */}
            <div className="dock-dish-pills" role="tablist" aria-label="Signature dish quick select">
              {DISHES.map((dish, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={dish.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`dock-pill-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => jumpToDish(idx)}
                    style={{
                      '--dish-accent': dish.accentColor,
                      '--dish-glow': dish.accentGlow,
                    }}
                  >
                    <span className="dock-pill-num">{dish.number}</span>
                    <span className="dock-pill-name">{dish.label}</span>
                    {isActive && <span className="dock-pill-glow-pip" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {/* Right Fresh Quality Tag */}
            <div className="dock-craft-meta dock-meta-right">
              <span className="dock-meta-accent">FRESH DAILY</span>
              <span className="dock-meta-title">WOOD KILN & MOUNTAIN HERBS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
