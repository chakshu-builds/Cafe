import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useFrameScrubber — High-Performance Senior-Architect Frame Animation Hook
 * 
 * Encapsulates:
 * 1. Two-phase intelligent keyframe preloading with concurrency control.
 * 2. Mobile-optimized responsive canvas framing with zero horizontal cropping.
 * 3. 60fps/120fps requestAnimationFrame render ticking.
 * 4. Fast O(1) outward keyframe search fallback to eliminate stutter & frozen frames.
 * 5. React 18 StrictMode resilient lifecycle & memory cleanup.
 *
 * @param {Object} config
 * @param {number} config.totalFrames - Total count of frames in sequence
 * @param {(index: number) => string} config.getFrameUrl - URL resolver for frame index
 * @param {React.RefObject} config.containerRef - Outer section DOM container
 * @param {React.RefObject} config.stickyRef - Sticky viewport DOM element to pin
 * @param {React.RefObject} config.canvasRef - Canvas DOM element for 2D rendering
 * @param {number} [config.verticalBias=0.5] - Desktop vertical centering bias
 * @param {number} [config.mobileVerticalBias=0.44] - Mobile vertical golden-ratio bias
 * @param {number} [config.mobileScale=1.05] - Mobile canvas width scale (fits subject cleanly)
 * @param {string|Function} [config.mobileRunway='+=300%'] - Mobile scroll runway length
 * @param {string|Function} [config.desktopRunway='+=500%'] - Desktop scroll runway length
 * @param {number} [config.keyframeStep=8] - Keyframe skeleton step interval
 * @param {number} [config.frameProgressRatio=0.88] - Point in scroll progress (0..1) where animation reaches final frame
 * @param {(progress: number, frame: number) => void} [config.onProgressUpdate] - Callback for text/overlay syncing
 */
export function useFrameScrubber({
  totalFrames,
  getFrameUrl,
  containerRef,
  stickyRef,
  canvasRef,
  verticalBias = 0.5,
  mobileVerticalBias = 0.44,
  mobileScale = 1.05,
  mobileRunway = '+=300%',
  desktopRunway = '+=500%',
  keyframeStep = 8,
  frameProgressRatio = 0.88,
  onProgressUpdate,
}) {
  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);

  // High-performance mutable state refs — completely decoupled from React render cycle
  const imagesCacheRef = useRef(new Array(totalFrames).fill(null));
  const currentFrameIndexRef = useRef(0);
  const lastDrawnImgRef = useRef(null);
  const isPreloadingRef = useRef(false);
  const loadingSetRef = useRef(new Set());
  const pendingFrameRef = useRef(null);
  const rafIdRef = useRef(null);
  const renderFrameRef = useRef(null);

  /**
   * Request an individual frame on-demand if not already cached or in-flight
   */
  const requestFrame = useCallback(
    (idx) => {
      if (idx < 0 || idx >= totalFrames) return;
      if (imagesCacheRef.current[idx] || loadingSetRef.current.has(idx)) return;

      loadingSetRef.current.add(idx);
      const img = new Image();
      img.src = getFrameUrl(idx);
      img.onload = () => {
        imagesCacheRef.current[idx] = img;
        loadingSetRef.current.delete(idx);
        // If user is currently resting adjacent to this newly arrived frame, refresh draw
        if (Math.abs(currentFrameIndexRef.current - idx) <= 2 && renderFrameRef.current) {
          renderFrameRef.current(currentFrameIndexRef.current);
        }
      };
      img.onerror = () => {
        loadingSetRef.current.delete(idx);
      };
    },
    [totalFrames, getFrameUrl]
  );

  /**
   * Render target frame onto canvas with smart aspect-ratio framing
   */
  const renderFrame = useCallback(
    (targetIndex) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // 1. Instant O(1) frame lookup with outward keyframe skeleton fallback
      let imgToDraw = imagesCacheRef.current[targetIndex];
      if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
        // Prioritize loading near-term window
        for (let offset = -2; offset <= 8; offset++) {
          requestFrame(targetIndex + offset);
        }

        // Fast outward search (radius < 35) to find closest ready frame
        let radius = 1;
        while (radius < 35) {
          const left = targetIndex - radius;
          const right = targetIndex + radius;
          if (left >= 0 && imagesCacheRef.current[left]?.complete && imagesCacheRef.current[left].naturalWidth > 0) {
            imgToDraw = imagesCacheRef.current[left];
            break;
          }
          if (right < totalFrames && imagesCacheRef.current[right]?.complete && imagesCacheRef.current[right].naturalWidth > 0) {
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

      // Clean background fill prevents edge bleeding
      ctx.fillStyle = '#080605';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      let drawW, drawH, drawX, drawY;

      if (canvasRatio > imgRatio) {
        // Desktop / wide aspect: edge-to-edge cover math with vertical bias
        drawW = canvasWidth;
        drawH = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawH) * verticalBias;
      } else {
        // Mobile / portrait screen: fit whole animation width cleanly with zero side-cropping
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          drawW = canvasWidth * mobileScale;
          drawH = drawW / imgRatio;
          drawX = (canvasWidth - drawW) * 0.5;
          drawY = (canvasHeight - drawH) * mobileVerticalBias;
        } else {
          drawH = canvasHeight;
          drawW = canvasHeight * imgRatio;
          drawX = (canvasWidth - drawW) * 0.5;
          drawY = (canvasHeight - drawH) * verticalBias;
        }
      }

      ctx.drawImage(imgToDraw, drawX, drawY, drawW, drawH);
    },
    [canvasRef, totalFrames, verticalBias, mobileVerticalBias, mobileScale, requestFrame]
  );

  renderFrameRef.current = renderFrame;

  /**
   * High-DPI and mobile-aware canvas sizing
   */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    // On mobile, DPR 1 cuts pixel rasterization by 75% for buttery 60fps locked performance
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    const newWidth = Math.round(rect.width * dpr);
    const newHeight = Math.round(rect.height * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      renderFrame(currentFrameIndexRef.current);
    }
  }, [canvasRef, renderFrame]);

  /**
   * Two-phase progressive frame preloader:
   * Phase 1: Keyframe skeleton across the entire sequence
   * Phase 2: Sequential filler queue with concurrency control
   */
  const preloadSubsequentFrames = useCallback(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    // Phase 1: Preload keyframe skeleton
    const keyframes = [];
    for (let i = keyframeStep; i < totalFrames; i += keyframeStep) {
      keyframes.push(i);
    }
    if (keyframes[keyframes.length - 1] !== totalFrames - 1) {
      keyframes.push(totalFrames - 1);
    }

    keyframes.forEach((frameNum) => {
      requestFrame(frameNum);
    });

    // Phase 2: Sequential fill-in with progressive concurrency
    let nextIndex = 1;
    const MAX_CONCURRENT = isMobile ? 4 : 8;
    let activeLoads = 0;

    const loadNext = () => {
      while (activeLoads < MAX_CONCURRENT && nextIndex < totalFrames) {
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

    setTimeout(loadNext, 150);
  }, [totalFrames, keyframeStep, getFrameUrl, requestFrame]);

  // Main lifecycle: Frame 0 init, ResizeObserver, and ScrollTrigger binding
  useEffect(() => {
    // 1. Load First Frame
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);

    firstImg.onload = () => {
      imagesCacheRef.current[0] = firstImg;
      setIsFirstFrameLoaded(true);

      handleResize();
      renderFrame(0);

      // Start preloader so keyframe skeleton is ready before user scrolls
      preloadSubsequentFrames();
    };

    firstImg.onerror = (err) => {
      console.error(`[useFrameScrubber] Frame 0 failed to load: ${firstImg.src}`, err);
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

    // 3. Set up GSAP ScrollTrigger
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = containerRef.current;
    const sticky = stickyRef.current;

    if (!container || !sticky) {
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: () => (window.innerWidth <= 768
        ? (typeof mobileRunway === 'function' ? mobileRunway() : mobileRunway)
        : (typeof desktopRunway === 'function' ? desktopRunway() : desktopRunway)),
      pin: sticky,
      pinSpacing: true,
      anticipatePin: 1,
      // Direct touch tracking on mobile touchscreens to eliminate rubber-band lag
      scrub: prefersReducedMotion ? false : (window.innerWidth <= 768 ? true : 0.15),
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 -> 1.0

        // Map scroll progress across frame sequence (holding final frame at tail)
        const frameProgress = Math.min(1, progress / frameProgressRatio);
        const targetFrame = Math.min(
          totalFrames - 1,
          Math.max(0, Math.floor(frameProgress * totalFrames))
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

        // Forward progress to caller for syncing text/editorial copy overlays
        if (onProgressUpdate) {
          onProgressUpdate(progress, targetFrame);
        }
      },
    });

    return () => {
      trigger.kill();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [
    containerRef,
    stickyRef,
    canvasRef,
    totalFrames,
    getFrameUrl,
    handleResize,
    renderFrame,
    preloadSubsequentFrames,
    mobileRunway,
    desktopRunway,
    frameProgressRatio,
    onProgressUpdate,
  ]);

  return {
    isFirstFrameLoaded,
    renderFrame,
    currentFrameIndex: currentFrameIndexRef.current,
  };
}
