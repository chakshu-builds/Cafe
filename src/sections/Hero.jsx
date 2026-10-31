import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';
import { TOTAL_FRAMES, getFrameUrl } from '../data/framesManifest';
import { useFrameScrubber } from '../hooks/useFrameScrubber';

/**
 * Hero Section — Fullscreen Pinned Coffee Pour Scrubber
 * Consumes the centralized useFrameScrubber architectural hook.
 */
export default function Hero() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  const centerBrandRef = useRef(null);
  const writtenBrandRef = useRef(null);
  const bottomTextRef = useRef(null);
  const indicatorRef = useRef(null);

  /**
   * Synchronized editorial copy updates driven by scroll progress
   */
  const handleProgressUpdate = useCallback((progress) => {
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
  }, []);

  // Frame Scrubber Hook
  const { isFirstFrameLoaded } = useFrameScrubber({
    totalFrames: TOTAL_FRAMES,
    getFrameUrl,
    containerRef,
    stickyRef,
    canvasRef,
    verticalBias: 0.5,
    mobileVerticalBias: 0.44,
    mobileScale: 1.05,
    mobileRunway: () => `+=${window.innerHeight * 3.8}`,
    desktopRunway: () => `+=${window.innerHeight * 6}`,
    keyframeStep: 10,
    onProgressUpdate: handleProgressUpdate,
  });

  // Staggered character typewriter animation for CAFE AESTHETICS
  useEffect(() => {
    const writtenEl = writtenBrandRef.current;
    if (!writtenEl) return;

    const chars = writtenEl.querySelectorAll('.written-char');
    const cursor = writtenEl.querySelector('.written-cursor');

    gsap.set(chars, { opacity: 0, display: 'none', y: 4 });
    if (cursor) gsap.set(cursor, { opacity: 1 });

    const writeTl = gsap.timeline({ delay: 0.35 });

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

    return () => {
      writeTl.kill();
    };
  }, []);

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
          className={`hero-loader ${isFirstFrameLoaded ? 'hidden' : ''}`}
          aria-hidden={isFirstFrameLoaded}
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

        {/* 2. BOTTOM-LEFT EDITORIAL TEXT */}
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
