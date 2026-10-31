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
  const centerBrandRef = useRef(null);
  const writtenBrandRef = useRef(null);
  const bottomTextRef = useRef(null);
  const indicatorRef = useRef(null);

  // State only for initial appearance to avoid re-renders during scroll
  const [isFirstFrameReady, setIsFirstFrameReady] = useState(false);

  // Mutable refs for high-performance 60fps rendering without React reconciler overhead
  const imagesCacheRef = useRef(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameIndexRef = useRef(0);
  const isPreloadingRef = useRef(false);
  const loadingSetRef = useRef(new Set());
  const renderFrameRef = useRef(null);
  const pendingFrameRef = useRef(null);
  const rafIdRef = useRef(null);
  const lastDrawnImgRef = useRef(null);

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
      if (Math.abs(currentFrameIndexRef.current - idx) <= 2 && renderFrameRef.current) {
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

    // Retrieve requested image or find the nearest loaded frame (e.g. keyframe skeleton)
    let imgToDraw = imagesCacheRef.current[targetIndex];
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      // Prioritize loading requested frame window forward & backward
      for (let offset = -2; offset <= 8; offset++) {
        requestFrame(targetIndex + offset);
      }
      // Fast outward search within a radius of 40 to find the closest ready frame
      let radius = 1;
      while (radius < 40) {
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
      // Desktop / landscape: edge-to-edge cover
      drawW = canvasWidth;
      drawH = canvasWidth / imgRatio;
      drawX = 0;
      drawY = (canvasHeight - drawH) * 0.5;
    } else {
      // Mobile / portrait: ensure 100% of the coffee animation is fully visible without side-cropping!
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // Fit width cleanly with 1.05x comfortable spread — zero cropping of cup, pitcher, or steam
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
  }, [requestFrame]);

  renderFrameRef.current = renderFrame;

  /**
   * Resize canvas to match display size with mobile-optimized DPI scaling.
   */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    // On mobile, DPR 1 cuts pixel fill-rate by 75% for 60fps fluidity
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
   * Two-phase intelligent background preloader:
   * Phase 1: Keyframe skeleton across the sequence (every 10th frame).
   * Phase 2: Sequential fill-in with mobile-aware concurrency.
   */
  const preloadSubsequentFrames = useCallback(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    // Phase 1: Preload keyframe skeleton
    const keyframes = [];
    for (let i = 10; i < TOTAL_FRAMES; i += 10) {
      keyframes.push(i);
    }
    if (keyframes[keyframes.length - 1] !== TOTAL_FRAMES - 1) {
      keyframes.push(TOTAL_FRAMES - 1);
    }

    let keyIdx = 0;
    const MAX_KEYFRAME_CONCURRENT = isMobile ? 3 : 6;
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

    // Phase 2: Sequential fill-in
    let nextIndex = 1;
    const MAX_CONCURRENT = isMobile ? 4 : 10;
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

      // Recalculate all downstream section triggers so Our Story starts strictly AFTER Hero finishes
      requestAnimationFrame(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
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

    // 3. Set up GSAP ScrollTrigger with responsive mobile travel distance and zero-lag scrub
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      // Balanced mobile runway: 3.8 viewport heights gives 4-5 natural swipes so full animation plays completely
      end: () => `+=${window.innerHeight * (window.innerWidth <= 768 ? 3.8 : 6)}`,
      pin: stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      // Direct touch tracking on mobile
      scrub: prefersReducedMotion ? false : (window.innerWidth <= 768 ? true : 0.15),
      onUpdate: (self) => {
        const progress = self.progress; // 0 to 1

        // Complete all frames across 0 -> 0.94 of scroll progress
        const frameProgress = Math.min(1, progress / 0.94);
        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(frameProgress * TOTAL_FRAMES))
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

        // 1. Center Brand Moment: Fade & glide upward during first 15% of scroll
        if (centerBrandRef.current) {
          const centerProgress = Math.min(1, progress / 0.15);
          const opacity = (1 - centerProgress).toFixed(3);
          const translateY = (centerProgress * -30).toFixed(1);
          centerBrandRef.current.style.opacity = opacity;
          centerBrandRef.current.style.transform = `translate(-50%, calc(-50% + ${translateY}px))`;
        }

        // 2. Bottom Editorial Text: Glides in smoothly as coffee pour finishes (0.68 -> 0.88)
        if (bottomTextRef.current) {
          let botOp = 0;
          if (progress < 0.68) {
            botOp = 0;
          } else if (progress > 0.88) {
            botOp = 1;
          } else {
            botOp = (progress - 0.68) / (0.88 - 0.68);
          }
          bottomTextRef.current.style.opacity = botOp.toFixed(3);
          bottomTextRef.current.style.transform = `translateY(${((1 - botOp) * 20).toFixed(1)}px)`;
          bottomTextRef.current.style.pointerEvents = botOp > 0.1 ? 'auto' : 'none';
        }

        // 3. Fade scroll indicator away quickly during first 6% of scroll
        if (indicatorRef.current) {
          const indicatorProgress = Math.min(1, progress / 0.06);
          indicatorRef.current.style.opacity = (1 - indicatorProgress).toFixed(3);
        }
      },
    });

    // 4. Staggered character written typewriter animation for CAFE AESTHETICS
    let writeTl = null;
    const writtenEl = writtenBrandRef.current;
    if (writtenEl) {
      const chars = writtenEl.querySelectorAll('.written-char');
      const cursor = writtenEl.querySelector('.written-cursor');

      gsap.set(chars, { opacity: 0, display: 'none', y: 4 });
      if (cursor) gsap.set(cursor, { opacity: 1 });

      writeTl = gsap.timeline({ delay: 0.35 });

      chars.forEach((char) => {
        writeTl.to(char, {
          display: 'inline-block',
          opacity: 1,
          y: 0,
          duration: 0.065,
          ease: 'power2.out',
        });
      });

      if (cursor) {
        writeTl.to(cursor, {
          opacity: 0,
          repeat: 6,
          yoyo: true,
          duration: 0.32,
          ease: 'steps(1)',
        });
      }
    }

    // Refresh and sort all triggers so subsequent sections (OurStory, etc.) start strictly after Hero
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      if (writeTl) writeTl.kill();
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

        {/* 1. CENTER STAGE: SINGLE-LINE "CAFE AESTHETICS" WRITTEN ANIMATION */}
        <div ref={centerBrandRef} className="hero-center-brand-wrap">
          <h1 ref={writtenBrandRef} className="hero-center-written-title" aria-label="CAFE AESTHETICS">
            {"CAFE AESTHETICS".split("").map((char, index) => (
              <span key={index} className="written-char">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
            <span className="written-cursor" aria-hidden="true" />
          </h1>
        </div>

        {/* 2. BOTTOM-LEFT EDITORIAL TEXT (Reveals near end of coffee sequence) */}
        <div className="hero-content-layer">
          <div ref={bottomTextRef} className="hero-bottom-text-group">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-line" aria-hidden="true" />
              <span>CRAFTED WITH PASSION</span>
            </div>

            <h2 className="hero-bottom-title">
              A moment of
              <span className="hero-bottom-break">pure indulgence.</span>
            </h2>

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
