import React, { useRef, useCallback } from 'react';
import { PIZZA_TOTAL_FRAMES, getPizzaFrameUrl } from '../data/pizzaManifest';
import { useFrameScrubber } from '../hooks/useFrameScrubber';

/**
 * PizzaShowcase — Fullscreen Pinned Pizza Slice & Cheese Pull Scrubber
 * Consumes the centralized useFrameScrubber architectural hook.
 */
export default function PizzaShowcase() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  const openingTitleRef = useRef(null);
  const finaleContentRef = useRef(null);

  /**
   * Synchronized editorial copy updates driven by scroll progress
   */
  const handleProgressUpdate = useCallback((progress) => {
    // 1. Opening Title Overlay: Visible during whole-pizza shot (0 -> 0.16), fades out (0.16 -> 0.35)
    if (openingTitleRef.current) {
      const fadeStart = 0.16;
      const fadeEnd = 0.35;
      let titleOpacity = 1;

      if (progress < fadeStart) {
        titleOpacity = 1;
      } else if (progress > fadeEnd) {
        titleOpacity = 0;
      } else {
        titleOpacity = 1 - (progress - fadeStart) / (fadeEnd - fadeStart);
      }

      openingTitleRef.current.style.opacity = titleOpacity.toFixed(3);
      openingTitleRef.current.style.transform = `translateY(${((1 - titleOpacity) * -24).toFixed(1)}px)`;
    }

    // 2. Finale Editorial Content: Fades in as cheese pull reaches peak stretch (0.68 -> 0.86)
    if (finaleContentRef.current) {
      const revealStart = 0.68;
      const revealEnd = 0.86;
      let finaleOpacity = 0;

      if (progress < revealStart) {
        finaleOpacity = 0;
      } else if (progress > revealEnd) {
        finaleOpacity = 1;
      } else {
        finaleOpacity = (progress - revealStart) / (revealEnd - revealStart);
      }

      finaleContentRef.current.style.opacity = finaleOpacity.toFixed(3);
      finaleContentRef.current.style.transform = `translateY(${((1 - finaleOpacity) * 28).toFixed(1)}px)`;
    }
  }, []);

  // Frame Scrubber Hook
  const { isFirstFrameLoaded } = useFrameScrubber({
    totalFrames: PIZZA_TOTAL_FRAMES,
    getFrameUrl: getPizzaFrameUrl,
    containerRef,
    stickyRef,
    canvasRef,
    verticalBias: 0.48,
    mobileVerticalBias: 0.44,
    mobileScale: 1.05,
    mobileRunway: '+=300%',
    desktopRunway: '+=500%',
    keyframeStep: 8,
    onProgressUpdate: handleProgressUpdate,
  });

  return (
    <section
      ref={containerRef}
      className="pizza-fs-container"
      id="pizza"
      aria-label="Chef Spcl. Pizza Fullscreen Showcase"
    >
      <div ref={stickyRef} className="pizza-fs-sticky">
        {/* Immediate loading placeholder for frame 0 */}
        <div
          className={`pizza-fs-loader ${isFirstFrameLoaded ? 'hidden' : ''}`}
          aria-hidden={isFirstFrameLoaded}
        >
          <span className="pizza-fs-loader-text">CHEF SPCL. PIZZA</span>
        </div>

        {/* Edge-to-Edge Full-Screen Canvas */}
        <canvas
          ref={canvasRef}
          className="pizza-fs-canvas"
          role="img"
          aria-label="Full-screen cinematic commercial of chef special wood-fired pizza with rising steam, slice lift, and melted cheese pull"
        />

        {/* Subtle Atmospheric Dark Vignettes */}
        <div className="pizza-fs-vignette-top" aria-hidden="true" />
        <div className="pizza-fs-vignette-bottom" aria-hidden="true" />

        {/* Opening Title Overlay (Lower-Center over the whole pizza) */}
        <div ref={openingTitleRef} className="pizza-fs-opening-overlay">
          <div className="opening-overlay-wrap">
            <h2 className="pizza-fs-main-title">CHEF SPCL. PIZZA</h2>
            <span className="pizza-fs-subtitle">WOOD FIRED PERFECTION</span>
          </div>
        </div>

        {/* Finale Supporting Editorial Content (Fades in over final cheese pull) */}
        <div ref={finaleContentRef} className="pizza-fs-finale-overlay">
          <div className="pizza-fs-finale-wrap">
            <div className="pizza-fs-eyebrow">
              <span className="pizza-fs-eyebrow-line" aria-hidden="true" />
              <span>THE ART OF THE SLICE</span>
            </div>

            <h3 className="pizza-fs-headline">
              Made to Be <span className="pizza-fs-headline-italic">Savoured.</span>
            </h3>

            <p className="pizza-fs-description">
              A golden, wood-fired crust. Rich, melted cheese. Every detail crafted to make the simplest moments unforgettable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
