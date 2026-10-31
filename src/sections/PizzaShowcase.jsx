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
  const lastDrawnImgRef = useRef(null);
  const pendingFrameRef = useRef(null);
  const rafIdRef = useRef(null);

  /**
   * Draw the target frame onto the full-screen canvas with edge-to-edge cover math
   */
  const renderFrame = useCallback((targetIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Retrieve target image or nearest ready keyframe
    let imgToDraw = imagesCacheRef.current[targetIndex];
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      // Fast outward search within radius of 25 for closest loaded frame
      let radius = 1;
      while (radius < 25) {
        const left = targetIndex - radius;
        const right = targetIndex + radius;
        if (left >= 0 && imagesCacheRef.current[left]?.complete && imagesCacheRef.current[left].naturalWidth > 0) {
          imgToDraw = imagesCacheRef.current[left];
          break;
        }
        if (right < PIZZA_TOTAL_FRAMES && imagesCacheRef.current[right]?.complete && imagesCacheRef.current[right].naturalWidth > 0) {
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
      // Vertically center with slight upward bias (48%) so lifted slice and cheese pull stay fully framed
      drawY = (canvasHeight - drawH) * 0.48;
    } else {
      // Mobile / portrait: ensure 100% of pizza and cheese stretch is in full view without side-cropping!
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
   * Progressive background preloading for all 192 pizza frames
   */
  const preloadSubsequentFrames = useCallback(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    // Phase 1: Keyframe skeleton across all 192 frames (every 8th frame)
    const keyframes = [];
    for (let i = 8; i < PIZZA_TOTAL_FRAMES; i += 8) {
      keyframes.push(i);
    }
    keyframes.push(PIZZA_TOTAL_FRAMES - 1);

    keyframes.forEach((frameNum) => {
      const img = new Image();
      img.src = getPizzaFrameUrl(frameNum);
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
      while (activeLoads < MAX_CONCURRENT && nextIndex < PIZZA_TOTAL_FRAMES) {
        const idx = nextIndex++;
        if (imagesCacheRef.current[idx]) {
          continue;
        }

        activeLoads++;
        const img = new Image();
        img.src = getPizzaFrameUrl(idx);
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
    // 1. Load First Frame immediately
    const firstImg = new Image();
    firstImg.src = getPizzaFrameUrl(0);

    firstImg.onload = () => {
      imagesCacheRef.current[0] = firstImg;
      setIsFirstFrameLoaded(true);

      handleResize();
      renderFrame(0);

      // Start preloading keyframes so full animation is ready when user scrolls here
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

    // 3. Set up GSAP ScrollTrigger with responsive mobile travel & direct touch scrubbing
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      // Balanced mobile runway: 300% gives 4-5 natural swipes so cheese-pull animation plays completely
      end: () => (window.innerWidth <= 768 ? '+=300%' : '+=500%'),
      pin: stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: prefersReducedMotion ? false : (window.innerWidth <= 768 ? true : 0.15),
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
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, renderFrame, preloadSubsequentFrames]);

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

        {/* Edge-to-Edge Full-Screen 60fps Canvas */}
        <canvas
          ref={canvasRef}
          className="pizza-fs-canvas"
          role="img"
          aria-label="Full-screen cinematic commercial of chef special wood-fired pizza with rising steam, slice lift, and melted cheese pull"
        />

        {/* Subtle Atmospheric Dark Vignettes (Edge gradients for contrast without blocking imagery) */}
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
