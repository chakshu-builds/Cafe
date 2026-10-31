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
    // Sort all ScrollTriggers strictly by DOM order and recalculate start/end positions
    const timeout = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 250);

    return () => clearTimeout(timeout);
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
