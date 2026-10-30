import React, { useState, useMemo } from 'react';
import { CULINARY_CATEGORIES, CULINARY_ITEMS } from '../data/culinaryDelightsData';

export default function CulinaryDelights() {
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Filter items based on active category selection
  const filteredItems = useMemo(() => {
    if (activeCategory === 'ALL') {
      return CULINARY_ITEMS;
    }
    return CULINARY_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <section
      className="culinary-delights-section"
      id="culinary-delights"
      aria-label="Culinary Delights Menu"
    >
      {/* Subtle Atmospheric Dark Ambient Glow */}
      <div className="culinary-ambient-glow" aria-hidden="true" />

      <div className="culinary-container">
        {/* ===================================================================
            1. SECTION HEADER
            Centered uppercase serif heading with subtle letter spacing
            =================================================================== */}
        <header className="culinary-header">
          <div className="culinary-eyebrow">
            <span className="culinary-eyebrow-line" aria-hidden="true" />
            <span>CHEF'S CURATED SELECTION</span>
            <span className="culinary-eyebrow-line" aria-hidden="true" />
          </div>

          <h2 className="culinary-main-title">CULINARY DELIGHTS</h2>
        </header>

        {/* ===================================================================
            2. COMPACT CATEGORY FILTER BUTTONS
            ALL · PIZZA · MOMOS · COFFEE · DESSERTS
            Active: gold/warm-yellow background with dark text.
            Inactive: dark background with subtle outlines & light text.
            =================================================================== */}
        <nav className="culinary-category-nav" aria-label="Menu categories filter">
          <div className="culinary-category-list" role="tablist">
            {CULINARY_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`culinary-filter-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ===================================================================
            3. THREE-COLUMN DESKTOP GRID OF HORIZONTAL MENU ROWS
            Small square food thumbnail on the left, name & price aligned on top line,
            muted short description beneath.
            =================================================================== */}
        <div
          className="culinary-grid"
          key={activeCategory}
          role="region"
          aria-live="polite"
        >
          {filteredItems.map((item, index) => (
            <article
              key={item.id}
              className="culinary-menu-item"
              style={{ '--item-index': index }}
            >
              {/* Small Food Thumbnail (Square, left-aligned) */}
              <div className="culinary-item-thumb-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  className="culinary-item-thumb"
                  loading="lazy"
                  width="74"
                  height="74"
                />
              </div>

              {/* Text Details Beside Thumbnail */}
              <div className="culinary-item-info">
                {/* Top Line: Item Name (left) & Price (right) */}
                <div className="culinary-item-header">
                  <h3 className="culinary-item-name">{item.name}</h3>
                  <span className="culinary-item-price">{item.price}</span>
                </div>

                {/* Short Muted Description */}
                <p className="culinary-item-desc">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
