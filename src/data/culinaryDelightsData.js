/**
 * CULINARY DELIGHTS — Curated Restaurant Menu Data
 * 22 Handcrafted Signature Items Across 4 Categories
 */

export const CULINARY_CATEGORIES = [
  { id: 'ALL', label: 'ALL' },
  { id: 'PIZZA', label: 'PIZZA' },
  { id: 'MOMOS', label: 'MOMOS' },
  { id: 'COFFEE', label: 'COFFEE' },
  { id: 'DESSERTS', label: 'DESSERTS' },
];

export const CULINARY_ITEMS = [
  // =========================================================================
  // PIZZA (6 Items)
  // =========================================================================
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    category: 'PIZZA',
    price: '₹299',
    rawPrice: 299,
    description: 'Fresh basil, mozzarella, and classic tomato sauce.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'spicy-pepperoni-pizza',
    name: 'Spicy Pepperoni Pizza',
    category: 'PIZZA',
    price: '₹399',
    rawPrice: 399,
    description: 'Bold pepperoni, melted cheese, and rich tomato sauce.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'truffle-mushroom-pizza',
    name: 'Truffle Mushroom Pizza',
    category: 'PIZZA',
    price: '₹449',
    rawPrice: 449,
    description: 'Wild mushrooms, creamy cheese, and delicate truffle notes.',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'prosciutto-arugula-pizza',
    name: 'Prosciutto & Arugula Pizza',
    category: 'PIZZA',
    price: '₹429',
    rawPrice: 429,
    description: 'Savory toppings finished with fresh peppery greens.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'bbq-chicken-pizza',
    name: 'BBQ Chicken Pizza',
    category: 'PIZZA',
    price: '₹379',
    rawPrice: 379,
    description: 'Smoky barbecue sauce, chicken, and melted cheese.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'veggie-supreme',
    name: 'Veggie Supreme',
    category: 'PIZZA',
    price: '₹349',
    rawPrice: 349,
    description: 'Garden vegetables, herbs, and mozzarella.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&h=300&q=80',
  },

  // =========================================================================
  // MOMOS (6 Items)
  // =========================================================================
  {
    id: 'steamed-veg-momos',
    name: 'Steamed Veg Momos',
    category: 'MOMOS',
    price: '₹179',
    rawPrice: 179,
    description: 'Delicate handmade dumplings with seasoned vegetable filling.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'steamed-chicken-momos',
    name: 'Steamed Chicken Momos',
    category: 'MOMOS',
    price: '₹199',
    rawPrice: 199,
    description: 'Tender dumplings filled with flavorful chicken.',
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'kurkure-momos',
    name: 'Kurkure Momos',
    category: 'MOMOS',
    price: '₹229',
    rawPrice: 229,
    description: 'Crispy-coated momos served with spicy dipping sauce.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'tandoori-momos',
    name: 'Tandoori Momos',
    category: 'MOMOS',
    price: '₹239',
    rawPrice: 239,
    description: 'Smoky, spiced momos with a rich tandoori finish.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'chilli-garlic-momos',
    name: 'Chilli Garlic Momos',
    category: 'MOMOS',
    price: '₹229',
    rawPrice: 229,
    description: 'Tossed in a bold chilli-garlic sauce.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'pan-fried-momos',
    name: 'Pan-Fried Momos',
    category: 'MOMOS',
    price: '₹219',
    rawPrice: 219,
    description: 'Golden, crisp-bottomed dumplings with a soft centre.',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=300&h=300&q=80',
  },

  // =========================================================================
  // COFFEE (6 Items)
  // =========================================================================
  {
    id: 'espresso',
    name: 'Espresso',
    category: 'COFFEE',
    price: '₹149',
    rawPrice: 149,
    description: 'Rich, bold espresso with a smooth finish.',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'COFFEE',
    price: '₹179',
    rawPrice: 179,
    description: 'Espresso topped with airy steamed milk foam.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'classic-latte',
    name: 'Classic Latte',
    category: 'COFFEE',
    price: '₹199',
    rawPrice: 199,
    description: 'Smooth espresso blended with silky milk.',
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'spanish-latte',
    name: 'Spanish Latte',
    category: 'COFFEE',
    price: '₹229',
    rawPrice: 229,
    description: 'Creamy coffee with a sweet, rich finish.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    category: 'COFFEE',
    price: '₹229',
    rawPrice: 229,
    description: 'Slow-steeped coffee served chilled.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'cafe-mocha',
    name: 'Café Mocha',
    category: 'COFFEE',
    price: '₹219',
    rawPrice: 219,
    description: 'Espresso, chocolate, and creamy milk.',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=300&h=300&q=80',
  },

  // =========================================================================
  // DESSERTS (4 Items)
  // =========================================================================
  {
    id: 'chocolate-brownie',
    name: 'Chocolate Brownie',
    category: 'DESSERTS',
    price: '₹179',
    rawPrice: 179,
    description: 'A rich, fudgy chocolate treat.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'new-york-cheesecake',
    name: 'New York Cheesecake',
    category: 'DESSERTS',
    price: '₹259',
    rawPrice: 259,
    description: 'Creamy cheesecake on a buttery crumb base.',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    category: 'DESSERTS',
    price: '₹279',
    rawPrice: 279,
    description: 'Coffee-soaked layers with a delicate cream finish.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'chocolate-lava-cake',
    name: 'Chocolate Lava Cake',
    category: 'DESSERTS',
    price: '₹229',
    rawPrice: 229,
    description: 'Warm chocolate cake with a molten centre.',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=300&h=300&q=80',
  },
];
