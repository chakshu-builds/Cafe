import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WAGYU_TOTAL_FRAMES, getWagyuFrameUrl } from '../data/wagyuManifest';

gsap.registerPlugin(ScrollTrigger);

export default function WagyuShowcase() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);

  // Overlay refs for scroll-scrubbed editorial storytelling
  const openingTitleRef = useRef(null);
  const finaleTitleRef = useRef(null);

  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);

  // Mutable refs to prevent React re-renders during high-frequency scroll scrubbing
  const imagesCacheRef = useRef(new Array(WAGYU_TOTAL_FRAMES).fill(null));
  const currentFrameIndexRef = useRef(0);
  const isPreloadingRef = useRef(false);

  /**
   * Render the target frame onto the full-screen canvas with edge-to-edge cover math
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

      for (let i = 0; i < WAGYU_TOTAL_FRAMES; i++) {
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
      // Vertically center with slight upward bias (49%) to frame burger and falling toppings
      drawY = (canvasHeight - drawH) * 0.49;
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
   * Resize canvas matching viewport with device pixel ratio scaling
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
   * Progressive background preloading for all 192 wagyu burger frames
   */
  const preloadSubsequentFrames = useCallback(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    let nextIndex = 1;
    const MAX_CONCURRENT = 8;
    let activeLoads = 0;

    const loadNext = () => {
      while (activeLoads < MAX_CONCURRENT && nextIndex < WAGYU_TOTAL_FRAMES) {
        const idx = nextIndex++;
        activeLoads++;

        const img = new Image();
        img.src = getWagyuFrameUrl(idx);
        img.onload = () => {
          imagesCacheRef.current[idx] = img;
          activeLoads--;
          loadNext();
        };
        img.onerror = () => {
          console.warn(`[Wagyu Showcase] Frame ${idx} failed to load from ${img.src}`);
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
    firstImg.src = getWagyuFrameUrl(0);

    firstImg.onload = () => {
      imagesCacheRef.current[0] = firstImg;
      setIsFirstFrameLoaded(true);

      handleResize();
      renderFrame(0);

      preloadSubsequentFrames();
    };

    firstImg.onerror = (err) => {
      console.error('[Wagyu Showcase] Critical: Frame 0 failed to load', err);
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
      end: '+=500%', // 5 full viewport heights giving all 192 frames luxurious, smooth scroll scrubbing
      pin: stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: prefersReducedMotion ? false : 0.15,
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 -> 1.0

        // All 192 frames complete within 0 -> 0.86 of scroll progress
        // The remaining 14% firmly locks the final rotated hero burger close-up in place
        const frameProgress = Math.min(1, progress / 0.86);
        const targetFrame = Math.min(
          WAGYU_TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(frameProgress * WAGYU_TOTAL_FRAMES))
        );

        if (targetFrame !== currentFrameIndexRef.current) {
          renderFrame(targetFrame);
        }

        // =====================================================================
        // Opening Title Overlay:
        // SIGNATURE WAGYU / PREMIUM CRAFTED BURGER
        // Visible at start during opening toasted bun shot (0 -> 0.14)
        // Fades out smoothly as assembly begins (0.14 -> 0.26)
        // Completely hidden during main assembly and hero rotation (0.26 -> 0.84)
        // =====================================================================
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

        // =====================================================================
        // Finale Title Overlay:
        // Appears after rotation completes over the final held hero shot (0.84 -> 0.90)
        // Stays visible through 1.00
        // =====================================================================
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
      className="wagyu-fs-container"
      id="wagyu-burger"
      aria-label="Signature Wagyu Burger Storytelling Showcase"
    >
      <div ref={stickyRef} className="wagyu-fs-sticky">
        {/* Immediate loading placeholder for frame 0 */}
        <div
          className={`wagyu-fs-loader ${isFirstFrameLoaded ? 'hidden' : ''}`}
          aria-hidden={isFirstFrameLoaded}
        >
          <span className="wagyu-fs-loader-text">SIGNATURE WAGYU</span>
        </div>

        {/* Edge-to-Edge Full-Screen 24fps Canvas */}
        <canvas
          ref={canvasRef}
          className="wagyu-fs-canvas"
          role="img"
          aria-label="Full-screen cinematic commercial of Signature Wagyu Burger assembling in mid-air with lettuce, tomato, flame-grilled wagyu patty, melted cheddar, crispy bacon, pickles, and sesame seed brioche bun"
        />

        {/* Seamless Atmospheric Gradient Vignettes (Blends dark CULINARY DELIGHTS background into warm amber dining footage) */}
        <div className="wagyu-fs-vignette-top" aria-hidden="true" />
        <div className="wagyu-fs-vignette-bottom" aria-hidden="true" />
        <div className="wagyu-fs-vignette-sides" aria-hidden="true" />

        {/* ===================================================================
            Opening Title Overlay (Lower-Center of the viewport)
            "SIGNATURE WAGYU / PREMIUM CRAFTED BURGER"
            =================================================================== */}
        <div ref={openingTitleRef} className="wagyu-fs-opening-overlay">
          <div className="wagyu-opening-wrap">
            <h2 className="wagyu-main-title">SIGNATURE WAGYU</h2>
            <p className="wagyu-subtitle">
              <em>PREMIUM CRAFTED BURGER</em>
            </p>
          </div>
        </div>

        {/* ===================================================================
            Finale Title Overlay (Upper-Center, reveals over final hero rotation shot)
            =================================================================== */}
        <div ref={finaleTitleRef} className="wagyu-fs-finale-overlay">
          <div className="wagyu-finale-wrap">
            <div className="wagyu-eyebrow">
              <span className="wagyu-eyebrow-line" aria-hidden="true" />
              <span>THE MASTERPIECE</span>
              <span className="wagyu-eyebrow-line" aria-hidden="true" />
            </div>
            <h3 className="wagyu-finale-heading">PERFECTION IN EVERY BITE</h3>
            <p className="wagyu-finale-caption">
              <em>Flame-grilled wagyu beef, melted cheddar & toasted brioche.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
