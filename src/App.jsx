import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PizzaShowcase from './components/PizzaShowcase';
import MenuSection from './components/MenuSection';
import MomosShowcase from './components/MomosShowcase';
import CulinaryDelights from './components/CulinaryDelights';
import WagyuShowcase from './components/WagyuShowcase';
import OurStory from './components/OurStory';
import Footer from './components/Footer';

export default function App() {
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
        <WagyuShowcase />
      </main>
      <Footer />
    </div>
  );
}
