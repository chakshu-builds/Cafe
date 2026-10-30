import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOMOS_TOTAL_FRAMES, getMomosFrameUrl } from '../data/momosManifest';

gsap.registerPlugin(ScrollTrigger);

export default function MomosShowcase() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);

  // Text overlay refs for scroll-scrubbed editorial storytelling
  const textOpeningRef = useRef(null);
  const textMiddleRef = useRef(null);
  const textCloseupRef = useRef(null);
  const textEndingRef = useRef(null);

  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);

  // Mutable refs to prevent React re-renders during high-frequency scroll updates
  const imagesCacheRef = useRef(new Array(MOMOS_TOTAL_FRAMES).fill(null));
  const currentFrameIndexRef = useRef(0);
  const isPreloadingRef = useRef(false);

  /**
   * Render the requested frame onto full-screen canvas with edge-to-edge cover math
   */
  const renderFrame = useCallback((targetIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Retrieve target image or nearest loaded neighbor to prevent any flash or blank frame
    let imgToDraw = imagesCacheRef.current[targetIndex];
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      let closestDist = Infinity;
      let closestIdx = -1;

      for (let i = 0; i < MOMOS_TOTAL_FRAMES; i++) {
        const candidate = imagesCacheRef.current[i];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          const dist = Math.abs(i - targetIndex);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        }
      }

      if (closestIdx !== -1) {
        imgToDraw = imagesCacheRef.current[closestIdx];
      }
    }

    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      return;
    }

    currentFrameIndexRef.current = targetIndex;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = imgToDraw.naturalWidth;
    const imgHeight = imgToDraw.naturalHeight;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawW, drawH, drawX, drawY;

    if (canvasRatio > imgRatio) {
      // Screen is wider than 16:9
      drawW = canvasWidth;
      drawH = canvasWidth / imgRatio;
      drawX = 0;
      // Vertically center with slight upward bias (50%) to keep steamer in view
      drawY = (canvasHeight - drawH) * 0.5;
    } else {
      // Screen is taller than 16:9 (mobile / portrait)
      drawH = canvasHeight;
      drawW = canvasHeight * imgRatio;
      drawX = (canvasWidth - drawW) * 0.5;
      drawY = 0;
    }

    ctx.drawImage(imgToDraw, drawX, drawY, drawW, drawH);
  }, []);

  /**
   * Resize canvas matching the entire viewport with device pixel ratio scaling
   */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const newWidth = Math.round(rect.width * dpr);
    const newHeight = Math.round(rect.height * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      renderFrame(currentFrameIndexRef.current);
    }
  }, [renderFrame]);

  /**
   * Progressive background preloading for all 192 momos frames
   */
  const preloadSubsequentFrames = useCallback(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    let nextIndex = 1;
    const MAX_CONCURRENT = 8;
    let activeLoads = 0;

    const loadNext = () => {
      while (activeLoads < MAX_CONCURRENT && nextIndex < MOMOS_TOTAL_FRAMES) {
        const idx = nextIndex++;
        activeLoads++;

        const img = new Image();
        img.src = getMomosFrameUrl(idx);
        img.onload = () => {
          imagesCacheRef.current[idx] = img;
          activeLoads--;
          loadNext();
        };
        img.onerror = () => {
          console.warn(`[Momos Showcase] Frame ${idx} failed to load from ${img.src}`);
          activeLoads--;
          loadNext();
        };
      }
    };

    loadNext();
  }, []);

  useEffect(() => {
    // 1. Immediately preload Opening Frame (Frame 0 = frame_0001.jpg)
    const firstImg = new Image();
    firstImg.src = getMomosFrameUrl(0);

    firstImg.onload = () => {
      imagesCacheRef.current[0] = firstImg;
      setIsFirstFrameLoaded(true);

      handleResize();
      renderFrame(0);

      preloadSubsequentFrames();
    };

    firstImg.onerror = (err) => {
      console.error('[Momos Showcase] Frame 0 failed to load', err);
      setIsFirstFrameLoaded(true);
    };

    // 2. Set up ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    window.addEventListener('resize', handleResize);

    // 3. Set up GSAP ScrollTrigger with full-screen pinning
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Helper to calculate smooth fade in / fade out opacity given progress and threshold bounds
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

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=500%', // 5 full viewport heights giving all 192 frames luxurious, smooth scroll scrubbing
      pin: stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: prefersReducedMotion ? false : 0.15,
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 -> 1.0

        // All 192 frames complete within 0 -> 0.88 of scroll progress
        // The remaining 12% firmly locks the final steaming momos basket in place
        const frameProgress = Math.min(1, progress / 0.88);
        const targetFrame = Math.min(
          MOMOS_TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(frameProgress * MOMOS_TOTAL_FRAMES))
        );

        if (targetFrame !== currentFrameIndexRef.current) {
          renderFrame(targetFrame);
        }

        // =====================================================================
        // Scroll-Synchronized Editorial Copy Transitions
        // =====================================================================

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
        // Positioned cleanly on the left side to avoid covering the food detail
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
      },
    });

    return () => {
      trigger.kill();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, renderFrame, preloadSubsequentFrames]);

  return (
    <section
      ref={containerRef}
      className="momos-fs-container"
      id="momos"
      aria-label="Artisan Steamed Momos Storytelling Showcase"
    >
      <div ref={stickyRef} className="momos-fs-sticky">
        {/* Immediate loading placeholder for frame 0 */}
        <div
          className={`momos-fs-loader ${isFirstFrameLoaded ? 'hidden' : ''}`}
          aria-hidden={isFirstFrameLoaded}
        >
          <span className="momos-fs-loader-text">STEAMED MOMOS</span>
        </div>

        {/* Edge-to-Edge Full-Screen 24fps Canvas */}
        <canvas
          ref={canvasRef}
          className="momos-fs-canvas"
          role="img"
          aria-label="Full-screen cinematic commercial of freshly steamed momos inside a traditional bamboo steamer with rising steam and delicate handcrafted folds"
        />

        {/* Seamless Atmospheric Gradient Vignettes (Blends dark menu background into warm ambient footage) */}
        <div className="momos-fs-vignette-top" aria-hidden="true" />
        <div className="momos-fs-vignette-bottom" aria-hidden="true" />
        <div className="momos-fs-vignette-sides" aria-hidden="true" />

        {/* ===================================================================
            1. OPENING OVERLAY (Upper-Center, frames 1 - ~45)
            "BEHIND EVERY FOLD / There's a little bit of love."
            =================================================================== */}
        <div ref={textOpeningRef} className="momos-overlay momos-overlay-opening">
          <div className="momos-text-block text-center">
            <div className="momos-eyebrow">
              <span className="momos-eyebrow-line" aria-hidden="true" />
              <span>HANDMADE DELICACY</span>
              <span className="momos-eyebrow-line" aria-hidden="true" />
            </div>
            <h2 className="momos-heading">BEHIND EVERY FOLD</h2>
            <p className="momos-caption">
              <em>There's a little bit of love.</em>
            </p>
          </div>
        </div>

        {/* ===================================================================
            2. MIDDLE OVERLAY (Top-Left / Header position, frames ~56 - ~110)
            "FRESHLY STEAMED. / Soft wrappers. Rich flavours. Made fresh, every time."
            =================================================================== */}
        <div ref={textMiddleRef} className="momos-overlay momos-overlay-middle">
          <div className="momos-text-block text-left">
            <div className="momos-eyebrow">
              <span className="momos-eyebrow-line" aria-hidden="true" />
              <span>STEAMED TO PERFECTION</span>
            </div>
            <h2 className="momos-heading">FRESHLY STEAMED.</h2>
            <p className="momos-caption">
              <em>Soft wrappers. Rich flavours. Made fresh, every time.</em>
            </p>
          </div>
        </div>

        {/* ===================================================================
            3. CLOSE-UP OVERLAY (Left-Side, frames ~125 - ~170)
            "CRAFTED BY HAND / Every fold tells a story of patience, tradition and taste."
            Positioned to the left side while chopsticks hold the momo on the right!
            =================================================================== */}
        <div ref={textCloseupRef} className="momos-overlay momos-overlay-closeup">
          <div className="momos-text-block text-left">
            <div className="momos-eyebrow">
              <span className="momos-eyebrow-line" aria-hidden="true" />
              <span>THE ARTISAN TOUCH</span>
            </div>
            <h2 className="momos-heading">CRAFTED BY HAND</h2>
            <p className="momos-caption">
              <em>Every fold tells a story of patience, tradition and taste.</em>
            </p>
          </div>
        </div>

        {/* ===================================================================
            4. ENDING OVERLAY (Lower-Center / Editorial Finale, frames ~175 - 192)
            "A LITTLE MOMENT OF COMFORT / Warm, delicate and made to be savoured."
            =================================================================== */}
        <div ref={textEndingRef} className="momos-overlay momos-overlay-ending">
          <div className="momos-text-block text-center">
            <div className="momos-eyebrow">
              <span className="momos-eyebrow-line" aria-hidden="true" />
              <span>PURE COMFORT</span>
              <span className="momos-eyebrow-line" aria-hidden="true" />
            </div>
            <h2 className="momos-heading">A LITTLE MOMENT OF COMFORT</h2>
            <p className="momos-caption">
              <em>Warm, delicate and made to be savoured.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
