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
  const lastDrawnImgRef = useRef(null);
  const pendingFrameRef = useRef(null);
  const rafIdRef = useRef(null);

  /**
   * Render the requested frame onto full-screen canvas with edge-to-edge cover math
   */
  const renderFrame = useCallback((targetIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Retrieve target image or nearest ready keyframe
    let imgToDraw = imagesCacheRef.current[targetIndex];
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      let radius = 1;
      while (radius < 25) {
        const left = targetIndex - radius;
        const right = targetIndex + radius;
        if (left >= 0 && imagesCacheRef.current[left]?.complete && imagesCacheRef.current[left].naturalWidth > 0) {
          imgToDraw = imagesCacheRef.current[left];
          break;
        }
        if (right < MOMOS_TOTAL_FRAMES && imagesCacheRef.current[right]?.complete && imagesCacheRef.current[right].naturalWidth > 0) {
          imgToDraw = imagesCacheRef.current[right];
          break;
        }
        radius++;
      }
      if (!imgToDraw) {
        imgToDraw = lastDrawnImgRef.current || imagesCacheRef.current[0];
      }
    }

    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      return;
    }

    lastDrawnImgRef.current = imgToDraw;
    currentFrameIndexRef.current = targetIndex;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = imgToDraw.naturalWidth;
    const imgHeight = imgToDraw.naturalHeight;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    // Fill canvas background to ensure seamless black edge blending
    ctx.fillStyle = '#080605';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    let drawW, drawH, drawX, drawY;

    if (canvasRatio > imgRatio) {
      // Desktop / landscape
      drawW = canvasWidth;
      drawH = canvasWidth / imgRatio;
      drawX = 0;
      // Vertically center with slight upward bias (50%) to keep steamer in view
      drawY = (canvasHeight - drawH) * 0.5;
    } else {
      // Mobile / portrait: ensure 100% of steamer and lifted momo is visible with zero side-cropping!
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        drawW = canvasWidth * 1.05;
        drawH = drawW / imgRatio;
        drawX = (canvasWidth - drawW) * 0.5;
        drawY = (canvasHeight - drawH) * 0.44;
      } else {
        drawH = canvasHeight;
        drawW = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawW) * 0.5;
        drawY = 0;
      }
    }

    ctx.drawImage(imgToDraw, drawX, drawY, drawW, drawH);
  }, []);

  /**
   * Resize canvas matching the entire viewport with mobile-optimized DPI scaling
   */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

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

    // Phase 1: Keyframe skeleton across all 192 frames (every 8th frame)
    const keyframes = [];
    for (let i = 8; i < MOMOS_TOTAL_FRAMES; i += 8) {
      keyframes.push(i);
    }
    keyframes.push(MOMOS_TOTAL_FRAMES - 1);

    keyframes.forEach((frameNum) => {
      const img = new Image();
      img.src = getMomosFrameUrl(frameNum);
      img.onload = () => {
        imagesCacheRef.current[frameNum] = img;
      };
    });

    // Phase 2: Sequential fill-in
    let nextIndex = 1;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const MAX_CONCURRENT = isMobile ? 4 : 8;
    let activeLoads = 0;

    const loadNext = () => {
      while (activeLoads < MAX_CONCURRENT && nextIndex < MOMOS_TOTAL_FRAMES) {
        const idx = nextIndex++;
        if (imagesCacheRef.current[idx]) {
          continue;
        }

        activeLoads++;
        const img = new Image();
        img.src = getMomosFrameUrl(idx);
        img.onload = () => {
          imagesCacheRef.current[idx] = img;
          activeLoads--;
          loadNext();
        };
        img.onerror = () => {
          activeLoads--;
          loadNext();
        };
      }
    };

    setTimeout(loadNext, 150);
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

      // Start preloading keyframes so full animation is ready when user scrolls here
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

    // 3. Set up GSAP ScrollTrigger with responsive mobile travel & direct touch scrubbing
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
      // Balanced mobile runway: 300% gives 4-5 natural swipes so full momos steam & fold story plays completely
      end: () => (window.innerWidth <= 768 ? '+=300%' : '+=500%'),
      pin: stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: prefersReducedMotion ? false : (window.innerWidth <= 768 ? true : 0.15),
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 -> 1.0

        // All 192 frames complete within 0 -> 0.88 of scroll progress
        const frameProgress = Math.min(1, progress / 0.88);
        const targetFrame = Math.min(
          MOMOS_TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(frameProgress * MOMOS_TOTAL_FRAMES))
        );

        if (targetFrame !== currentFrameIndexRef.current) {
          pendingFrameRef.current = targetFrame;
          if (!rafIdRef.current) {
            rafIdRef.current = requestAnimationFrame(() => {
              if (pendingFrameRef.current !== null) {
                renderFrame(pendingFrameRef.current);
              }
              rafIdRef.current = null;
            });
          }
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
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, renderFrame, preloadSubsequentFrames]);

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

        {/* Seamless Atmospheric Gradient Vignettes (Blends dark menu background into warm ambient footage) */}
        <div className="momos-fs-vignette-top" aria-hidden="true" />
        <div className="momos-fs-vignette-bottom" aria-hidden="true" />
        <div className="momos-fs-vignette-sides" aria-hidden="true" />

        {/* ===================================================================
            1. OPENING OVERLAY (Upper-Center, frames 1 - ~45)
            "CHEF SPCL. MOMOS / STEAMED TO PERFECTION"
            =================================================================== */}
        <div ref={textOpeningRef} className="momos-overlay momos-overlay-opening">
          <div className="momos-text-block text-center">
            <h2 className="momos-main-title">CHEF SPCL. MOMOS</h2>
            <span className="momos-subtitle">STEAMED TO PERFECTION</span>
          </div>
        </div>

        {/* ===================================================================
            2. MIDDLE OVERLAY (Top-Left / Header position, frames ~56 - ~110)
            =================================================================== */}
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

        {/* ===================================================================
            3. CLOSE-UP OVERLAY (Left-Side, frames ~125 - ~170)
            =================================================================== */}
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

        {/* ===================================================================
            4. ENDING OVERLAY (Lower-Center / Editorial Finale, frames ~175 - 192)
            =================================================================== */}
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
