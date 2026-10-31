import React, { useRef, useCallback } from 'react';
import { WAGYU_TOTAL_FRAMES, getWagyuFrameUrl } from '../data/wagyuManifest';
import { useFrameScrubber } from '../hooks/useFrameScrubber';

/**
 * WagyuShowcase — Chef Special Flame-Grilled Wagyu Burger Storytelling Section
 *
 * Uses `useFrameScrubber` for 60fps/120fps hardware-accelerated canvas scrubbing,
 * responsive mobile framing (zero side-crop), and 2-phase skeleton preloading.
 */
export default function WagyuShowcase() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);

  // Overlay refs for scroll-scrubbed editorial storytelling
  const openingTitleRef = useRef(null);
  const finaleTitleRef = useRef(null);

  // High-performance direct DOM style updates on scroll scrub
  const handleProgressUpdate = useCallback((progress) => {
    // 1. OPENING TITLE OVERLAY (0.0 -> 0.26)
    // Visible at start during toasted bun shot (0 -> 0.14), fades out smoothly as assembly begins (0.14 -> 0.26)
    if (openingTitleRef.current) {
      let op = 1;
      if (progress <= 0.14) {
        op = 1;
      } else if (progress >= 0.26) {
        op = 0;
      } else {
        op = 1 - (progress - 0.14) / (0.26 - 0.14);
      }
      openingTitleRef.current.style.opacity = op.toFixed(3);
      openingTitleRef.current.style.transform = `translateY(${((1 - op) * -22).toFixed(1)}px)`;
      openingTitleRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
    }

    // 2. FINALE TITLE OVERLAY (0.84 -> 1.00)
    // Appears after rotation completes over the final held hero shot (0.84 -> 0.90), stays visible through 1.00
    if (finaleTitleRef.current) {
      let op = 0;
      if (progress < 0.84) {
        op = 0;
      } else if (progress > 0.90) {
        op = 1;
      } else {
        op = (progress - 0.84) / (0.90 - 0.84);
      }
      finaleTitleRef.current.style.opacity = op.toFixed(3);
      finaleTitleRef.current.style.transform = `translateY(${((1 - op) * 20).toFixed(1)}px)`;
      finaleTitleRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
    }
  }, []);

  const { isFirstFrameLoaded } = useFrameScrubber({
    totalFrames: WAGYU_TOTAL_FRAMES,
    getFrameUrl: getWagyuFrameUrl,
    containerRef,
    stickyRef,
    canvasRef,
    verticalBias: 0.49,
    mobileVerticalBias: 0.45,
    mobileScale: 1.05,
    mobileRunway: '+=300%',
    desktopRunway: '+=500%',
    frameProgressRatio: 0.86,
    onProgressUpdate: handleProgressUpdate,
  });

  return (
    <section
      ref={containerRef}
      className="wagyu-fs-container"
      id="wagyu-burger"
      aria-label="Chef Spcl. Burger Storytelling Showcase"
    >
      <div ref={stickyRef} className="wagyu-fs-sticky">
        {/* Immediate loading placeholder for frame 0 */}
        <div
          className={`wagyu-fs-loader ${isFirstFrameLoaded ? 'hidden' : ''}`}
          aria-hidden={isFirstFrameLoaded}
        >
          <span className="wagyu-fs-loader-text">CHEF SPCL. BURGER</span>
        </div>

        {/* Edge-to-Edge Full-Screen 24fps Canvas */}
        <canvas
          ref={canvasRef}
          className="wagyu-fs-canvas"
          role="img"
          aria-label="Full-screen cinematic commercial of Chef Special Burger assembling in mid-air with lettuce, tomato, flame-grilled wagyu patty, melted cheddar, crispy bacon, pickles, and sesame seed brioche bun"
        />

        {/* Atmospheric Gradient Vignettes */}
        <div className="wagyu-fs-vignette-top" aria-hidden="true" />
        <div className="wagyu-fs-vignette-bottom" aria-hidden="true" />
        <div className="wagyu-fs-vignette-sides" aria-hidden="true" />

        {/* 1. Opening Title Overlay (Lower-Center) */}
        <div ref={openingTitleRef} className="wagyu-fs-opening-overlay">
          <div className="wagyu-opening-wrap">
            <h2 className="wagyu-main-title">CHEF SPCL. BURGER</h2>
            <span className="wagyu-subtitle">FLAME GRILLED PERFECTION</span>
          </div>
        </div>

        {/* 2. Finale Title Overlay (Upper-Center) */}
        <div ref={finaleTitleRef} className="wagyu-fs-finale-overlay">
          <div className="wagyu-finale-wrap">
            <div className="wagyu-eyebrow">
              <span className="wagyu-eyebrow-line" aria-hidden="true" />
              <span>THE MASTERPIECE</span>
              <span className="wagyu-eyebrow-line" aria-hidden="true" />
            </div>
            <h3 className="wagyu-finale-heading">PERFECTION IN EVERY BITE</h3>
            <p className="wagyu-finale-caption">
              Flame-grilled wagyu beef, melted cheddar & toasted brioche.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
