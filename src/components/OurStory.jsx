import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STORY_CARDS = [
  {
    id: 'craft',
    badge: '01 / OUR CRAFT',
    title: 'Our Craft',
    description: 'Artisan food preparation, honest ingredients, and meticulous attention to every nuance of taste and texture.',
    image: '/images/pizza_ingredients_craft.jpg',
    alt: 'Fresh artisanal ingredients, buffalo mozzarella, fresh basil, and candlelight in kitchen roastery',
  },
  {
    id: 'story',
    badge: '02 / PHILOSOPHY',
    title: 'Our Story',
    description: 'Born from a quiet devotion to the art of the pour—where science bows to sensory mastery and slow, deliberate rituals.',
    image: '/images/our_story_ritual.jpg',
    alt: 'Master barista executing single-origin pour-over coffee ritual with curling aromatic steam',
  },
  {
    id: 'experience',
    badge: '03 / HOSPITALITY',
    title: 'Our Experience',
    description: 'A sanctuary of amber warmth and understated elegance, crafted to turn ordinary moments into something worth remembering.',
    image: '/images/our_experience_atmosphere.jpg',
    alt: 'Warm luxury dining room with glowing amber pendant lamps and inviting atmosphere',
  },
];

export default function OurStory() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const headerRef = useRef(null);
  const cardLeftRef = useRef(null);
  const cardCenterRef = useRef(null);
  const cardRightRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Calculate responsive horizontal spread distance
      const getSpreadOffset = () => {
        const w = window.innerWidth;
        if (w > 1280) return 370;
        if (w > 1024) return 310;
        if (w > 768) return 240;
        return 70; // Mobile compact arrangement
      };

      // Set initial 3D folded-fan arrangement
      // Center card is foremost, left card is tucked behind and rotated inward, right card tucked behind rotated inward
      gsap.set(cardCenterRef.current, {
        x: 0,
        y: 0,
        z: 35,
        rotationY: 0,
        rotationZ: 0,
        scale: 1.02,
        transformOrigin: '50% 50%',
      });

      gsap.set(cardLeftRef.current, {
        x: 70, // Tucked inward behind center card
        y: 12,
        z: -45,
        rotationY: 26, // Rotated inward like a folded fan
        rotationZ: -4,
        scale: 0.96,
        transformOrigin: '90% 50%',
      });

      gsap.set(cardRightRef.current, {
        x: -70, // Tucked inward behind center card
        y: 12,
        z: -45,
        rotationY: -26, // Rotated inward like a folded fan
        rotationZ: 4,
        scale: 0.96,
        transformOrigin: '10% 50%',
      });

      // Header initial subtle state
      gsap.set(headerRef.current, {
        opacity: 0.55,
        y: 18,
      });

      // ScrollTrigger timeline that gradually unfolds the 3D cards
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=160%',
          pin: stickyRef.current,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const spread = getSpreadOffset();
      const isMobile = window.innerWidth <= 768;

      if (!isMobile) {
        // Desktop / Tablet full 3D fan unfolding
        tl.to(
          cardLeftRef.current,
          {
            x: -spread,
            y: 0,
            z: 0,
            rotationY: -3,
            rotationZ: 0,
            scale: 1,
            ease: 'power2.out',
          },
          0
        )
          .to(
            cardRightRef.current,
            {
              x: spread,
              y: 0,
              z: 0,
              rotationY: 3,
              rotationZ: 0,
              scale: 1,
              ease: 'power2.out',
            },
            0
          )
          .to(
            cardCenterRef.current,
            {
              scale: 1.04,
              z: 40,
              ease: 'power2.out',
            },
            0
          )
          .to(
            headerRef.current,
            {
              y: 0,
              opacity: 1,
              ease: 'power1.out',
            },
            0
          );
      } else {
        // Mobile compact unfolding without clipping
        tl.to(
          cardLeftRef.current,
          {
            x: -spread,
            y: -15,
            z: 0,
            rotationY: -8,
            rotationZ: -2,
            scale: 0.98,
            ease: 'power2.out',
          },
          0
        )
          .to(
            cardRightRef.current,
            {
              x: spread,
              y: 15,
              z: 0,
              rotationY: 8,
              rotationZ: 2,
              scale: 0.98,
              ease: 'power2.out',
            },
            0
          )
          .to(
            headerRef.current,
            {
              y: 0,
              opacity: 1,
              ease: 'power1.out',
            },
            0
          );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="story-3d-section"
      id="story"
      aria-label="Our Story — Behind the Experience"
    >
      <div ref={stickyRef} className="story-3d-sticky">
        {/* Subtle Ambient Radial Glow */}
        <div className="story-ambient-glow" aria-hidden="true" />

        <div className="story-3d-container">
          {/* ===================================================================
              Header: BEHIND THE EXPERIENCE / More Than Just a Café.
              =================================================================== */}
          <header ref={headerRef} className="story-3d-header">
            <div className="story-3d-eyebrow">
              <span className="story-eyebrow-line" aria-hidden="true" />
              <span>BEHIND THE EXPERIENCE</span>
              <span className="story-eyebrow-line" aria-hidden="true" />
            </div>

            <h2 className="story-3d-heading">More Than Just a Café.</h2>

            <p className="story-3d-description">
              <em>
                Every cup, every plate, every detail — thoughtfully crafted to turn ordinary moments into something worth remembering.
              </em>
            </p>
          </header>

          {/* ===================================================================
              3D Cards Stage: Folded Fan Arrangement that Unfolds on Scroll
              =================================================================== */}
          <div className="story-3d-stage" role="region" aria-label="Interactive Story Cards">
            <div className="story-3d-cards-wrapper">
              {/* Card 1: Our Craft (Left) */}
              <article
                ref={cardLeftRef}
                className="story-3d-card card-left"
                aria-label="Our Craft"
              >
                <div className="story-card-inner">
                  <img
                    src={STORY_CARDS[0].image}
                    alt={STORY_CARDS[0].alt}
                    className="story-card-img"
                    loading="lazy"
                  />
                  <div className="story-card-gradient" aria-hidden="true" />
                  <div className="story-card-content">
                    <span className="story-card-badge">{STORY_CARDS[0].badge}</span>
                    <h3 className="story-card-title">{STORY_CARDS[0].title}</h3>
                    <p className="story-card-desc">{STORY_CARDS[0].description}</p>
                  </div>
                </div>
              </article>

              {/* Card 2: Our Story (Center — Primary Focal Point) */}
              <article
                ref={cardCenterRef}
                className="story-3d-card card-center"
                aria-label="Our Story"
              >
                <div className="story-card-inner">
                  <img
                    src={STORY_CARDS[1].image}
                    alt={STORY_CARDS[1].alt}
                    className="story-card-img"
                    loading="lazy"
                  />
                  <div className="story-card-gradient" aria-hidden="true" />
                  <div className="story-card-content">
                    <span className="story-card-badge">{STORY_CARDS[1].badge}</span>
                    <h3 className="story-card-title">{STORY_CARDS[1].title}</h3>
                    <p className="story-card-desc">{STORY_CARDS[1].description}</p>
                  </div>
                </div>
              </article>

              {/* Card 3: Our Experience (Right) */}
              <article
                ref={cardRightRef}
                className="story-3d-card card-right"
                aria-label="Our Experience"
              >
                <div className="story-card-inner">
                  <img
                    src={STORY_CARDS[2].image}
                    alt={STORY_CARDS[2].alt}
                    className="story-card-img"
                    loading="lazy"
                  />
                  <div className="story-card-gradient" aria-hidden="true" />
                  <div className="story-card-content">
                    <span className="story-card-badge">{STORY_CARDS[2].badge}</span>
                    <h3 className="story-card-title">{STORY_CARDS[2].title}</h3>
                    <p className="story-card-desc">{STORY_CARDS[2].description}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
