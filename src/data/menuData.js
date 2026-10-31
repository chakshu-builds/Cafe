/**
 * CAFE AESTHETICS — Centralized Curated Menu Data
 * 14 Handcrafted Signature Items Across 6 Culinary Categories
 */

export const MENU_CATEGORIES = [
  { id: 'ALL', label: 'ALL' },
  { id: 'COFFEE', label: 'COFFEE' },
  { id: 'SIGNATURE', label: 'SIGNATURE' },
  { id: 'COLD COFFEE', label: 'COLD COFFEE' },
  { id: 'PIZZA', label: 'PIZZA' },
  { id: 'TEA', label: 'TEA' },
  { id: 'DESSERTS', label: 'DESSERTS' },
];

export const MENU_ITEMS = [
  // ==========================================
  // 1. COFFEE SELECTION
  // ==========================================
  {
    id: 'espresso',
    name: 'Espresso',
    category: 'COFFEE',
    categoryLabel: 'COFFEE',
    price: '₹149',
    rawPrice: 149,
    description: 'Rich, bold espresso with a velvety smooth finish.',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&h=500&q=80',
    order: 1,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'COFFEE',
    categoryLabel: 'COFFEE',
    price: '₹179',
    rawPrice: 179,
    description: 'Double espresso topped with airy, textured milk foam.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&h=500&q=80',
    order: 2,
  },
  {
    id: 'classic-latte',
    name: 'Classic Latte',
    category: 'COFFEE',
    categoryLabel: 'COFFEE',
    price: '₹199',
    rawPrice: 199,
    description: 'Smooth espresso harmonized with silky steamed microfoam.',
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=500&h=500&q=80',
    order: 3,
  },

  // ==========================================
  // 2. SIGNATURE CREATIONS
  // ==========================================
  {
    id: 'spanish-latte',
    name: 'Spanish Latte',
    category: 'SIGNATURE',
    categoryLabel: 'SIGNATURE COFFEE',
    price: '₹229',
    rawPrice: 229,
    description: 'Espresso blended with creamy, delicately sweetened milk.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=500&h=500&q=80',
    order: 4,
  },
  {
    id: 'caramel-cloud-latte',
    name: 'Caramel Cloud Latte',
    category: 'SIGNATURE',
    categoryLabel: 'SIGNATURE COFFEE',
    price: '₹249',
    rawPrice: 249,
    description: 'Smooth coffee layered with rich buttery caramel cloud foam.',
    image: 'https://images.unsplash.com/photo-1595928642581-f50f4f3453a5?auto=format&fit=crop&w=500&h=500&q=80',
    order: 5,
  },

  // ==========================================
  // 3. COLD COFFEE
  // ==========================================
  {
    id: 'classic-cold-brew',
    name: 'Classic Cold Brew',
    category: 'COLD COFFEE',
    categoryLabel: 'COLD COFFEE',
    price: '₹229',
    rawPrice: 229,
    description: 'Slow-steeped 16-hour single-origin coffee served chilled over ice.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&h=500&q=80',
    order: 6,
  },
  {
    id: 'iced-caramel-macchiato',
    name: 'Iced Caramel Macchiato',
    category: 'COLD COFFEE',
    categoryLabel: 'COLD COFFEE',
    price: '₹249',
    rawPrice: 249,
    description: 'Chilled milk, pulled espresso shots, and vanilla-caramel drizzle.',
    image: 'https://images.unsplash.com/photo-1572286258217-40142c1c6a70?auto=format&fit=crop&w=500&h=500&q=80',
    order: 7,
  },

  // ==========================================
  // 4. CHEF SPCL. PIZZA
  // ==========================================
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    category: 'PIZZA',
    categoryLabel: 'CHEF SPCL. PIZZA',
    price: '₹299',
    rawPrice: 299,
    description: 'San Marzano tomatoes, fresh buffalo mozzarella, and aromatic basil.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&h=500&q=80',
    order: 8,
  },
  {
    id: 'truffle-mushroom-pizza',
    name: 'Truffle Mushroom Pizza',
    category: 'PIZZA',
    categoryLabel: 'CHEF SPCL. PIZZA',
    price: '₹399',
    rawPrice: 399,
    description: 'Sautéed wild mushrooms, white truffle drizzle, and melted fior di latte.',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=500&h=500&q=80',
    order: 9,
  },
  {
    id: 'four-cheese-pizza',
    name: 'Four Cheese Pizza',
    category: 'PIZZA',
    categoryLabel: 'CHEF SPCL. PIZZA',
    price: '₹429',
    rawPrice: 429,
    description: 'Gorgonzola, aged parmesan, provolone, and fresh mozzarella.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&h=500&q=80',
    order: 10,
  },

  // ==========================================
  // 5. ARTISAN TEA & REFRESHERS
  // ==========================================
  {
    id: 'masala-chai',
    name: 'Masala Chai Artisan',
    category: 'TEA',
    categoryLabel: 'TEA & REFRESHERS',
    price: '₹129',
    rawPrice: 129,
    description: 'Assam black tea brewed with green cardamom, ginger, and cinnamon.',
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=500&h=500&q=80',
    order: 11,
  },
  {
    id: 'peach-iced-tea',
    name: 'Peach Iced Tea',
    category: 'TEA',
    categoryLabel: 'TEA & REFRESHERS',
    price: '₹179',
    rawPrice: 179,
    description: 'Cold-brewed Ceylon tea infused with white peach nectar and mint.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&h=500&q=80',
    order: 12,
  },

  // ==========================================
  // 6. PATISSERIE & DESSERTS
  // ==========================================
  {
    id: 'tiramisu',
    name: 'Espresso Tiramisu',
    category: 'DESSERTS',
    categoryLabel: 'BAKERY & DESSERTS',
    price: '₹279',
    rawPrice: 279,
    description: 'Espresso-soaked savoiardi biscuits, whipped mascarpone, and dark cocoa.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&h=500&q=80',
    order: 13,
  },
  {
    id: 'chocolate-lava-cake',
    name: 'Chocolate Lava Cake',
    category: 'DESSERTS',
    categoryLabel: 'BAKERY & DESSERTS',
    price: '₹229',
    rawPrice: 229,
    description: 'Warm Belgian chocolate cake with a molten truffle centre.',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&h=500&q=80',
    order: 14,
  },
];
