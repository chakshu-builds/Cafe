import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { FRAME_FILES, TOTAL_FRAMES, getFrameUrl } from '../data/framesManifest';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  const headlineRef = useRef(null);
  const indicatorRef = useRef(null);

  // State only for initial appearance to avoid re-renders during scroll
  const [isFirstFrameReady, setIsFirstFrameReady] = useState(false);

  // Mutable refs for high-performance 60fps rendering without React reconciler overhead
  const imagesCacheRef = useRef(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameIndexRef = useRef(0);
  const isPreloadingRef = useRef(false);
  const loadingSetRef = useRef(new Set());
  const renderFrameRef = useRef(null);

  /**
   * Request an individual frame on-demand if not already cached/in-flight
   */
  const requestFrame = useCallback((idx) => {
    if (idx < 0 || idx >= TOTAL_FRAMES) return;
    if (imagesCacheRef.current[idx] || loadingSetRef.current.has(idx)) return;

    loadingSetRef.current.add(idx);
    const img = new Image();
    img.src = getFrameUrl(idx);
    img.onload = () => {
      imagesCacheRef.current[idx] = img;
      loadingSetRef.current.delete(idx);
      // Re-draw if currently viewing or adjacent to this frame
      if (Math.abs(currentFrameIndexRef.current - idx) <= 1 && renderFrameRef.current) {
        renderFrameRef.current(currentFrameIndexRef.current);
      }
    };
    img.onerror = () => {
      loadingSetRef.current.delete(idx);
    };
  }, []);

  /**
   * Draw the target frame onto the canvas using high-DPI aware aspect-ratio cover.
   */
  const renderFrame = useCallback((targetIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Retrieve requested image or fallback to nearest loaded frame to prevent blank screen
    let imgToDraw = imagesCacheRef.current[targetIndex];
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      // Prioritize loading requested frame and nearby forward window
      for (let offset = 0; offset <= 4; offset++) {
        requestFrame(targetIndex + offset);
      }

      // Fast outward search from targetIndex to find nearest available frame
      let radius = 1;
      while (radius < TOTAL_FRAMES) {
        const left = targetIndex - radius;
        const right = targetIndex + radius;

        if (left >= 0 && imagesCacheRef.current[left]?.complete && imagesCacheRef.current[left].naturalWidth > 0) {
          imgToDraw = imagesCacheRef.current[left];
          break;
        }
        if (right < TOTAL_FRAMES && imagesCacheRef.current[right]?.complete && imagesCacheRef.current[right].naturalWidth > 0) {
          imgToDraw = imagesCacheRef.current[right];
          break;
        }
        radius++;
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
      drawY = (canvasHeight - drawH) * 0.5;
    } else {
      // Screen is taller than 16:9 (e.g. portrait/mobile)
      drawH = canvasHeight;
      drawW = canvasHeight * imgRatio;
      drawX = (canvasWidth - drawW) * 0.5;
      drawY = 0;
    }

    ctx.drawImage(imgToDraw, drawX, drawY, drawW, drawH);
  }, [requestFrame]);

  renderFrameRef.current = renderFrame;

  /**
   * Resize canvas to match display size with high-DPI scaling.
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
   * Two-phase intelligent background preloader:
   * Phase 1: Keyframe skeleton (every 10th frame) across the whole 600-frame sequence.
   * Phase 2: High-density concurrent queue for all remaining frames.
   */
  const preloadSubsequentFrames = useCallback(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    // Phase 1: Preload keyframe skeleton
    const keyframes = [];
    for (let i = 10; i < TOTAL_FRAMES; i += 10) {
      keyframes.push(i);
    }
    if (keyframes[keyframes.length - 1] !== TOTAL_FRAMES - 1) {
      keyframes.push(TOTAL_FRAMES - 1);
    }

    let keyIdx = 0;
    const MAX_KEYFRAME_CONCURRENT = 6;
    let activeKeyframeLoads = 0;

    const loadKeyframes = () => {
      while (activeKeyframeLoads < MAX_KEYFRAME_CONCURRENT && keyIdx < keyframes.length) {
        const frameNum = keyframes[keyIdx++];
        activeKeyframeLoads++;
        requestFrame(frameNum);
        setTimeout(() => {
          activeKeyframeLoads--;
          loadKeyframes();
        }, 20);
      }
    };
    loadKeyframes();

    // Phase 2: Sequential fill-in with progressive concurrency
    let nextIndex = 1;
    const MAX_CONCURRENT = 10;
    let activeLoads = 0;

    const loadNext = () => {
      while (activeLoads < MAX_CONCURRENT && nextIndex < TOTAL_FRAMES) {
        const idx = nextIndex++;
        if (imagesCacheRef.current[idx]) {
          continue;
        }

        activeLoads++;
        const img = new Image();
        img.src = getFrameUrl(idx);
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

    setTimeout(loadNext, 350);
  }, [requestFrame]);

  // Initialize frame 0 immediately and set up ScrollTrigger
  useEffect(() => {
    // 1. Load First Frame
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);

    firstImg.onload = () => {
      imagesCacheRef.current[0] = firstImg;
      setIsFirstFrameReady(true);

      // Size canvas & draw initial frame immediately
      handleResize();
      renderFrame(0);

      // Start preloading rest of sequence
      preloadSubsequentFrames();
    };

    firstImg.onerror = (err) => {
      console.error('[Cafe Hero] Critical: Frame 0 failed to load', err);
      setIsFirstFrameReady(true);
    };

    // 2. Set up ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    window.addEventListener('resize', handleResize);

    // 3. Set up GSAP ScrollTrigger with explicit pinning
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=600%', // 600% viewport scroll distance giving all 600 frames smooth cinematic pace
      pin: stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: prefersReducedMotion ? false : 0.15,
      onUpdate: (self) => {
        const progress = self.progress; // 0 to 1

        // Complete 600 frames within 0 -> 0.90 of the pinned scroll progress
        // The remaining 10% holds the completed final frame firmly pinned before unpinning
        const frameProgress = Math.min(1, progress / 0.90);
        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(frameProgress * TOTAL_FRAMES))
        );

        if (targetFrame !== currentFrameIndexRef.current) {
          renderFrame(targetFrame);
        }

        // Refined editorial text choreography:
        // Fade & glide headline away during the first 16% of scroll
        if (headlineRef.current) {
          const textProgress = Math.min(1, progress / 0.16);
          const opacity = (1 - textProgress).toFixed(3);
          const translateY = (textProgress * -28).toFixed(1);
          headlineRef.current.style.opacity = opacity;
          headlineRef.current.style.transform = `translateY(${translateY}px)`;
        }

        // Fade scroll indicator away quickly during first 6% of scroll
        if (indicatorRef.current) {
          const indicatorProgress = Math.min(1, progress / 0.06);
          indicatorRef.current.style.opacity = (1 - indicatorProgress).toFixed(3);
        }
      },
    });

    return () => {
      trigger.kill();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, renderFrame, preloadSubsequentFrames]);

  const scrollToStart = () => {
    if (!containerRef.current) return;
    const targetY = window.innerHeight * 0.8;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={containerRef}
      className="hero-scroll-container"
      id="home"
      aria-label="Cafe Aesthetics Hero Experience"
    >
      <div ref={stickyRef} className="hero-sticky-frame">
        {/* Loading overlay for Frame 0 */}
        <div
          className={`hero-loader ${isFirstFrameReady ? 'hidden' : ''}`}
          aria-hidden={isFirstFrameReady}
        >
          <span className="loader-brand">CAFE AESTHETICS</span>
          <div className="loader-bar-track">
            <div className="loader-bar-fill"></div>
          </div>
        </div>

        {/* 3D Coffee Sequence Canvas */}
        <canvas
          ref={canvasRef}
          className="hero-canvas"
          role="img"
          aria-label="Cinematic slow-motion coffee experience with rising steam and pouring milk"
        />

        {/* Subtle Atmospheric Vignettes */}
        <div className="hero-overlay-top" aria-hidden="true" />
        <div className="hero-overlay-vignette" aria-hidden="true" />
        <div className="hero-overlay-bottom" aria-hidden="true" />

        {/* Foreground Editorial Text Layer */}
        <div className="hero-content-layer">
          <div ref={headlineRef} className="hero-headline-group">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-line" aria-hidden="true" />
              <span>CRAFTED WITH PASSION</span>
            </div>

            <h1 className="hero-title">
              A moment of
              <span className="hero-title-break">pure indulgence.</span>
            </h1>

            <p className="hero-subtitle">
              Slow down. Savour every sip.
            </p>
          </div>

          {/* Bottom Scroll Indicator */}
          <div
            ref={indicatorRef}
            className="hero-scroll-indicator"
            onClick={scrollToStart}
            role="button"
            tabIndex={0}
            aria-label="Scroll down to begin coffee experience"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToStart();
              }
            }}
          >
            <span className="hero-scroll-label">SCROLL TO EXPERIENCE</span>
            <ChevronDown className="hero-scroll-icon" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
