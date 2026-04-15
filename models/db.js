// In-memory data store
// Note: Data resets on server restart. For production, swap with MongoDB/PostgreSQL.

let foods = [
  {
    id: '1',
    name: 'Masala Burger',
    category: 'Snacks',
    description: 'Crispy patty, fresh veggies & special house sauce',
    price: 60,
    image: '/images/burger.jpg',
    available: true,
    prepTime: 10
  },
  {
    id: '2',
    name: 'Veg Sandwich',
    category: 'Snacks',
    description: 'Toasted bread, cheese, fresh vegetables & mayo',
    price: 45,
    image: '/images/sandwich.jpg',
    available: true,
    prepTime: 8
  },
  {
    id: '3',
    name: 'Filter Coffee',
    category: 'Beverages',
    description: 'Rich South Indian filter coffee, freshly brewed',
    price: 20,
    image: '/images/coffee.jpg',
    available: true,
    prepTime: 5
  },
  {
    id: '4',
    name: 'Chicken Biryani',
    category: 'Meals',
    description: 'Aromatic basmati rice with tender chicken pieces',
    price: 120,
    image: '/images/icon.jpg',
    available: true,
    prepTime: 15
  },
  {
    id: '5',
    name: 'Veg Biryani',
    category: 'Meals',
    description: 'Fragrant rice with seasonal vegetables & spices',
    price: 90,
    image: '/images/icon.jpg',
    available: true,
    prepTime: 12
  },
  {
    id: '6',
    name: 'Lemon Juice',
    category: 'Beverages',
    description: 'Fresh lime juice with mint, served cold',
    price: 25,
    image: '/images/coffee.jpg',
    available: true,
    prepTime: 3
  }
];

let orders = [];
let orderCounter = 1000;

function generateOrderId() {
  return `SC${++orderCounter}`;
}

function generateToken() {
  return String(orderCounter).slice(-3);
}

module.exports = { foods, orders, generateOrderId, generateToken };
