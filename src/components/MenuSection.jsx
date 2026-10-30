import React, { useState, useMemo } from 'react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menuData';

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Filter items based on active category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'ALL') {
      return MENU_ITEMS;
    }
    return MENU_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="menu-section" id="menu" aria-label="Cafe Menu">
      {/* Subtle Ambient Radial Gold Glow for Atmospheric Depth */}
      <div className="menu-ambient-glow" aria-hidden="true" />

      <div className="menu-container">
        {/* ===================================================================
            1. REFINED HEADER
            =================================================================== */}
        <header className="menu-header">
          <div className="menu-eyebrow">
            <span className="menu-eyebrow-line" aria-hidden="true" />
            <span>THE CAFE EXPERIENCE</span>
            <span className="menu-eyebrow-line" aria-hidden="true" />
          </div>

          <h2 className="menu-main-title">A Little Something for Every Craving</h2>

          <p className="menu-subtitle">
            From your first coffee of the morning to the last bite of something sweet.
          </p>
        </header>

        {/* ===================================================================
            2. CATEGORY NAVIGATION & FILTERING
            ALL · COFFEE · SIGNATURE · COLD COFFEE · PIZZA · TEA · DESSERTS
            =================================================================== */}
        <nav className="menu-category-nav" aria-label="Menu categories">
          <div className="menu-category-list" role="tablist">
            {MENU_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`menu-category-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="category-btn-text">{cat.label}</span>
                  {isActive && <span className="category-active-line" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ===================================================================
            3. CIRCULAR MENU GRID (5 ITEMS PER ROW ON DESKTOP)
            No cards, no boxed backgrounds. Pure black backdrop with golden accents.
            =================================================================== */}
        <div
          className="menu-grid"
          key={activeCategory} // Triggers clean CSS fade-in transition when filtering
          role="region"
          aria-live="polite"
        >
          {filteredItems.map((item, index) => (
            <article
              key={item.id}
              className="menu-item"
              style={{ '--item-stagger': `${Math.min(index * 0.04, 0.4)}s` }}
            >
              {/* Circular Food / Beverage Image */}
              <div className="menu-item-image-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  className="menu-item-image"
                  loading="lazy"
                  width="300"
                  height="300"
                />
                <div className="menu-item-image-ring" aria-hidden="true" />
              </div>

              {/* Compact Category Label */}
              <span className="menu-item-category">{item.categoryLabel}</span>

              {/* Elegant Item Name */}
              <h3 className="menu-item-name">{item.name}</h3>

              {/* Muted Short Description */}
              <p className="menu-item-desc">{item.description}</p>

              {/* Golden Refined Price */}
              <span className="menu-item-price">{item.price}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
