import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PIZZA_TOTAL_FRAMES, getPizzaFrameUrl } from '../data/pizzaManifest';

gsap.registerPlugin(ScrollTrigger);

export default function PizzaShowcase() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  const openingTitleRef = useRef(null);
  const finaleContentRef = useRef(null);

  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);

  // Mutable refs to prevent any React re-render during scroll scrubbing
  const imagesCacheRef = useRef(new Array(PIZZA_TOTAL_FRAMES).fill(null));
  const currentFrameIndexRef = useRef(0);
  const isPreloadingRef = useRef(false);

  /**
   * Draw the target frame onto the full-screen canvas with edge-to-edge cover math
   */
  const renderFrame = useCallback((targetIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Retrieve target image or nearest loaded fallback to eliminate any black flash
    let imgToDraw = imagesCacheRef.current[targetIndex];
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      let closestDist = Infinity;
      let closestIdx = -1;

      for (let i = 0; i < PIZZA_TOTAL_FRAMES; i++) {
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
      // Vertically center with slight upward bias (48%) so lifted slice and cheese pull stay fully framed
      drawY = (canvasHeight - drawH) * 0.48;
    } else {
      // Screen is taller than 16:9 (portrait / mobile)
      drawH = canvasHeight;
      drawW = canvasHeight * imgRatio;
      drawX = (canvasWidth - drawW) * 0.5;
      drawY = 0;
    }

    ctx.drawImage(imgToDraw, drawX, drawY, drawW, drawH);
  }, []);

  /**
   * Resize canvas matching the entire viewport with high-DPI scaling
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
   * Progressive background preloading for all 192 pizza frames
   */
  const preloadSubsequentFrames = useCallback(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    let nextIndex = 1;
    const MAX_CONCURRENT = 8;
    let activeLoads = 0;

    const loadNext = () => {
      while (activeLoads < MAX_CONCURRENT && nextIndex < PIZZA_TOTAL_FRAMES) {
        const idx = nextIndex++;
        activeLoads++;

        const img = new Image();
        img.src = getPizzaFrameUrl(idx);
        img.onload = () => {
          imagesCacheRef.current[idx] = img;
          activeLoads--;
          loadNext();
        };
        img.onerror = () => {
          console.warn(`[Pizza Showcase] Frame ${idx} failed to load from ${img.src}`);
          activeLoads--;
          loadNext();
        };
      }
    };

    loadNext();
  }, []);

  useEffect(() => {
    // 1. Load First Frame immediately
    const firstImg = new Image();
    firstImg.src = getPizzaFrameUrl(0);

    firstImg.onload = () => {
      imagesCacheRef.current[0] = firstImg;
      setIsFirstFrameLoaded(true);

      handleResize();
      renderFrame(0);

      preloadSubsequentFrames();
    };

    firstImg.onerror = (err) => {
      console.error('[Pizza Showcase] Critical: Frame 0 failed to load', err);
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

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=500%', // 5 full viewport heights giving all 192 frames luxurious room
      pin: stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: prefersReducedMotion ? false : 0.15,
      onUpdate: (self) => {
        const progress = self.progress; // 0 to 1

        // All 192 frames complete within 0 -> 0.86 of scroll progress
        // The remaining 14% firmly locks the final steaming cheese-pull frame in place
        const frameProgress = Math.min(1, progress / 0.86);
        const targetFrame = Math.min(
          PIZZA_TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(frameProgress * PIZZA_TOTAL_FRAMES))
        );

        if (targetFrame !== currentFrameIndexRef.current) {
          renderFrame(targetFrame);
        }

        // Opening Title Overlay:
        // Visible at start during whole-pizza shot (0 -> 0.16)
        // Fades out and glides upward smoothly between 0.16 and 0.35, before slice lifting begins
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

        // Finale Editorial Content:
        // Smoothly fades in as the dramatic cheese-pull sequence reaches completion (0.68 -> 0.86)
        // Stays prominently visible over the held final frame
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
      className="pizza-fs-container"
      id="pizza"
      aria-label="Artisan Pizza Fullscreen Showcase"
    >
      <div ref={stickyRef} className="pizza-fs-sticky">
        {/* Immediate loading placeholder for frame 0 */}
        <div
          className={`pizza-fs-loader ${isFirstFrameLoaded ? 'hidden' : ''}`}
          aria-hidden={isFirstFrameLoaded}
        >
          <span className="pizza-fs-loader-text">ARTISAN PIZZA</span>
        </div>

        {/* Edge-to-Edge Full-Screen 60fps Canvas */}
        <canvas
          ref={canvasRef}
          className="pizza-fs-canvas"
          role="img"
          aria-label="Full-screen cinematic commercial of artisan wood-fired pizza with rising steam, slice lift, and melted cheese pull"
        />

        {/* Subtle Atmospheric Dark Vignettes (Edge gradients for contrast without blocking imagery) */}
        <div className="pizza-fs-vignette-top" aria-hidden="true" />
        <div className="pizza-fs-vignette-bottom" aria-hidden="true" />

        {/* Opening Title Overlay (Lower-Center over the whole pizza) */}
        <div ref={openingTitleRef} className="pizza-fs-opening-overlay">
          <div className="opening-overlay-wrap">
            <h2 className="pizza-fs-main-title">ARTISAN PIZZA</h2>
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
