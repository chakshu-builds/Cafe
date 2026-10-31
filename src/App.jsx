import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import OurStory from './sections/OurStory';
import PizzaShowcase from './sections/PizzaShowcase';
import MenuSection from './sections/MenuSection';
import MomosShowcase from './sections/MomosShowcase';
import CulinaryDelights from './sections/CulinaryDelights';
import GrillInterlude from './sections/GrillInterlude';
import WagyuShowcase from './sections/WagyuShowcase';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    // 1. Refresh ScrollTrigger once web fonts (Outfit, Cormorant Garamond, Inter) are fully rendered
    let isMounted = true;

    const refreshScrollTriggers = () => {
      if (!isMounted) return;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        refreshScrollTriggers();
      });
    }

    // 2. Safety fallback refresh after initial DOM paint and layout settling
    const timer = setTimeout(refreshScrollTriggers, 300);

    // 3. Coordinated orientation change / window resize refresh with debounce
    let resizeTimer = null;
    const handleOrientationOrResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        refreshScrollTriggers();
      }, 150);
    };

    window.addEventListener('orientationchange', handleOrientationOrResize);
    window.addEventListener('resize', handleOrientationOrResize);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener('orientationchange', handleOrientationOrResize);
      window.removeEventListener('resize', handleOrientationOrResize);
    };
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <OurStory />
        <PizzaShowcase />
        <MenuSection />
        <MomosShowcase />
        <CulinaryDelights />
        {/* Cinematic transitional interlude before Wagyu Burger section */}
        <GrillInterlude />
        <WagyuShowcase />
      </main>
      <Footer />
    </div>
  );
}
