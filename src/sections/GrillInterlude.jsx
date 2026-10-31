import React from 'react';
import { Flame, ArrowDown } from 'lucide-react';

export default function GrillInterlude() {
  return (
    <section className="grill-interlude-section" aria-label="From Kiln to Flame — The Grill Craft">
      {/* Ambient background glow & subtle ember textures */}
      <div className="interlude-ambient-glow" aria-hidden="true" />
      <div className="interlude-embers-overlay" aria-hidden="true" />

      <div className="interlude-content-wrap">
        {/* Top Brass Hairline Flourish */}
        <div className="interlude-kicker-row">
          <span className="interlude-hairline" />
          <div className="interlude-badge">
            <Flame size={13} className="interlude-badge-icon" />
            <span className="interlude-badge-text">CHAPTER II · LIVING FLAME</span>
          </div>
          <span className="interlude-hairline" />
        </div>

        {/* Master Heading in Outfit ExtraBold (800) */}
        <h2 className="interlude-hero-title">
          Where Fire Meets <span className="interlude-highlight">Precision.</span>
        </h2>

        {/* Crisp Storytelling Caption */}
        <p className="interlude-lead-desc">
          From stone-kiln crusts to the searing embers of the iron grill.
          Every cut is dry-aged, every flame calibrated for the ultimate sensory bite.
        </p>

        {/* Artisanal Feature Badges */}
        <div className="interlude-pills-row">
          <div className="interlude-pill">
            <span className="pill-dot" />
            <span>100% WAGYU BEEF</span>
          </div>
          <div className="interlude-pill">
            <span className="pill-dot" />
            <span>OAK-SMOKED CHEDDAR</span>
          </div>
          <div className="interlude-pill">
            <span className="pill-dot" />
            <span>HAND-ROLLED BRIOCHE</span>
          </div>
        </div>

        {/* Subtle scroll cue down to Chef Special Burger */}
        <div className="interlude-scroll-cue" aria-hidden="true">
          <span className="cue-label">DISCOVER THE BURGER</span>
          <ArrowDown size={14} className="cue-arrow" />
        </div>
      </div>
    </section>
  );
}

