const express = require('express');
const router = express.Router();
const { foods } = require('../models/db');

// GET all foods
router.get('/', (req, res) => {
  res.json(foods);
});

// GET food by id
router.get('/:id', (req, res) => {
  const food = foods.find(f => f.id === req.params.id);
  if (!food) return res.status(404).json({ error: 'Food not found' });
  res.json(food);
});

// POST add food (admin)
router.post('/', (req, res) => {
  const { name, category, price, image, prepTime } = req.body;
  const newFood = {
    id: String(Date.now()),
    name, category,
    price: Number(price),
    image: image || '/images/icon.jpg',
    available: true,
    prepTime: Number(prepTime) || 10
  };
  foods.push(newFood);
  res.status(201).json(newFood);
});

// PUT update food (admin)
router.put('/:id', (req, res) => {
  const idx = foods.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Food not found' });
  foods[idx] = { ...foods[idx], ...req.body };
  res.json(foods[idx]);
});

// DELETE food (admin)
router.delete('/:id', (req, res) => {
  const idx = foods.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Food not found' });
  foods.splice(idx, 1);
  res.json({ success: true });
});

// PATCH toggle availability
router.patch('/:id/toggle', (req, res) => {
  const food = foods.find(f => f.id === req.params.id);
  if (!food) return res.status(404).json({ error: 'Food not found' });
  food.available = !food.available;
  res.json(food);
});

module.exports = router;