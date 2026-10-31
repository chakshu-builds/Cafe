import React, { useRef, useCallback } from 'react';
import { MOMOS_TOTAL_FRAMES, getMomosFrameUrl } from '../data/momosManifest';
import { useFrameScrubber } from '../hooks/useFrameScrubber';

/**
 * Helper to calculate smooth fade in / fade out opacity given progress and threshold bounds
 */
const calcBlockOpacity = (progress, inStart, inEnd, outStart, outEnd) => {
  if (progress < inStart) return 0;
  if (progress >= inStart && progress < inEnd) {
    return (progress - inStart) / (inEnd - inStart);
  }
  if (progress >= inEnd && progress <= outStart) {
    return 1;
  }
  if (progress > outStart && progress < outEnd) {
    return 1 - (progress - outStart) / (outEnd - outStart);
  }
  return 0;
};

/**
 * MomosShowcase — Chef Special Handcrafted Momos Cinematic Storytelling Section
 *
 * Uses `useFrameScrubber` for 60fps/120fps hardware-accelerated canvas scrubbing,
 * responsive mobile framing (zero side-crop), and 2-phase skeleton preloading.
 */
export default function MomosShowcase() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);

  // Text overlay refs for scroll-scrubbed editorial storytelling
  const textOpeningRef = useRef(null);
  const textMiddleRef = useRef(null);
  const textCloseupRef = useRef(null);
  const textEndingRef = useRef(null);

  // High-performance direct DOM style updates on scroll scrub
  const handleProgressUpdate = useCallback((progress) => {
    // 1. OPENING: BEHIND EVERY FOLD / There's a little bit of love.
    // Full at start (0 -> 0.14), fades out smoothly (0.14 -> 0.22)
    if (textOpeningRef.current) {
      let op = 1;
      if (progress <= 0.14) {
        op = 1;
      } else if (progress >= 0.22) {
        op = 0;
      } else {
        op = 1 - (progress - 0.14) / (0.22 - 0.14);
      }
      textOpeningRef.current.style.opacity = op.toFixed(3);
      textOpeningRef.current.style.transform = `translateY(${((1 - op) * -22).toFixed(1)}px)`;
      textOpeningRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
    }

    // 2. MIDDLE: FRESHLY STEAMED. / Soft wrappers. Rich flavours. Made fresh, every time.
    // Appears as lid opens and steam wafts (0.25 -> 0.30 in, 0.30 -> 0.44 visible, 0.44 -> 0.50 out)
    if (textMiddleRef.current) {
      const op = calcBlockOpacity(progress, 0.25, 0.30, 0.44, 0.50);
      textMiddleRef.current.style.opacity = op.toFixed(3);
      textMiddleRef.current.style.transform = `translateY(${((1 - op) * 20).toFixed(1)}px)`;
      textMiddleRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
    }

    // 3. CLOSE-UP: CRAFTED BY HAND / Every fold tells a story of patience, tradition and taste.
    // Appears as chopsticks lift momo into macro close-up (0.53 -> 0.58 in, 0.58 -> 0.72 visible, 0.72 -> 0.78 out)
    if (textCloseupRef.current) {
      const op = calcBlockOpacity(progress, 0.53, 0.58, 0.72, 0.78);
      textCloseupRef.current.style.opacity = op.toFixed(3);
      textCloseupRef.current.style.transform = `translateY(${((1 - op) * 20).toFixed(1)}px)`;
      textCloseupRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
    }

    // 4. ENDING: A LITTLE MOMENT OF COMFORT / Warm, delicate and made to be savoured.
    // Appears as finale sequence completes (0.80 -> 0.86 in, stays visible through 1.00)
    if (textEndingRef.current) {
      let op = 0;
      if (progress < 0.80) {
        op = 0;
      } else if (progress > 0.86) {
        op = 1;
      } else {
        op = (progress - 0.80) / (0.86 - 0.80);
      }
      textEndingRef.current.style.opacity = op.toFixed(3);
      textEndingRef.current.style.transform = `translateY(${((1 - op) * 20).toFixed(1)}px)`;
      textEndingRef.current.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
    }
  }, []);

  const { isFirstFrameLoaded } = useFrameScrubber({
    totalFrames: MOMOS_TOTAL_FRAMES,
    getFrameUrl: getMomosFrameUrl,
    containerRef,
    stickyRef,
    canvasRef,
    verticalBias: 0.5,
    mobileVerticalBias: 0.44,
    mobileScale: 1.05,
    mobileRunway: '+=300%',
    desktopRunway: '+=500%',
    frameProgressRatio: 0.88,
    onProgressUpdate: handleProgressUpdate,
  });

  return (
    <section
      ref={containerRef}
      className="momos-fs-container"
      id="momos"
      aria-label="Chef Spcl. Momos Storytelling Showcase"
    >
      <div ref={stickyRef} className="momos-fs-sticky">
        {/* Immediate loading placeholder for frame 0 */}
        <div
          className={`momos-fs-loader ${isFirstFrameLoaded ? 'hidden' : ''}`}
          aria-hidden={isFirstFrameLoaded}
        >
          <span className="momos-fs-loader-text">CHEF SPCL. MOMOS</span>
        </div>

        {/* Edge-to-Edge Full-Screen 24fps Canvas */}
        <canvas
          ref={canvasRef}
          className="momos-fs-canvas"
          role="img"
          aria-label="Full-screen cinematic commercial of freshly steamed momos inside a traditional bamboo steamer with rising steam and delicate handcrafted folds"
        />

        {/* Atmospheric Gradient Vignettes */}
        <div className="momos-fs-vignette-top" aria-hidden="true" />
        <div className="momos-fs-vignette-bottom" aria-hidden="true" />
        <div className="momos-fs-vignette-sides" aria-hidden="true" />

        {/* 1. OPENING OVERLAY */}
        <div ref={textOpeningRef} className="momos-overlay momos-overlay-opening">
          <div className="momos-text-block text-center">
            <h2 className="momos-main-title">CHEF SPCL. MOMOS</h2>
            <span className="momos-subtitle">STEAMED TO PERFECTION</span>
          </div>
        </div>

        {/* 2. MIDDLE OVERLAY */}
        <div ref={textMiddleRef} className="momos-overlay momos-overlay-middle">
          <div className="momos-text-block text-left">
            <div className="momos-eyebrow">
              <span className="momos-eyebrow-line" aria-hidden="true" />
              <span>STEAMED TO PERFECTION</span>
            </div>
            <h3 className="momos-heading">FRESHLY STEAMED.</h3>
            <p className="momos-caption">
              Soft wrappers. Rich flavours. Made fresh, every time.
            </p>
          </div>
        </div>

        {/* 3. CLOSE-UP OVERLAY */}
        <div ref={textCloseupRef} className="momos-overlay momos-overlay-closeup">
          <div className="momos-text-block text-left">
            <div className="momos-eyebrow">
              <span className="momos-eyebrow-line" aria-hidden="true" />
              <span>THE ARTISAN TOUCH</span>
            </div>
            <h3 className="momos-heading">CRAFTED BY HAND</h3>
            <p className="momos-caption">
              Every fold tells a story of patience, tradition and taste.
            </p>
          </div>
        </div>

        {/* 4. ENDING OVERLAY */}
        <div ref={textEndingRef} className="momos-overlay momos-overlay-ending">
          <div className="momos-text-block text-center">
            <div className="momos-eyebrow">
              <span className="momos-eyebrow-line" aria-hidden="true" />
              <span>PURE COMFORT</span>
              <span className="momos-eyebrow-line" aria-hidden="true" />
            </div>
            <h3 className="momos-heading">A LITTLE MOMENT OF COMFORT</h3>
            <p className="momos-caption">
              Warm, delicate and made to be savoured.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
