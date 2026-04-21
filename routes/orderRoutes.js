const express = require('express');
const router = express.Router();
const { orders, generateOrderId, generateToken } = require('../models/db');

// GET all orders
router.get('/', (req, res) => {
  const { status } = req.query;
  if (status) return res.json(orders.filter(o => o.status === status));
  res.json(orders);
});

// GET single order
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// POST create order
router.post('/', (req, res) => {
 const { items, customerName, pickupSlot, groupSize, paymentMethod } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: generateOrderId(),
    token: generateToken(),
    customerName: customerName || 'Guest',
    items,
    total,
    pickupSlot: pickupSlot || 'ASAP',
groupSize: groupSize || 1,
paymentMethod: paymentMethod || 'online',
    paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
    status: 'placed',
    placedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.unshift(order);
  res.status(201).json(order);
});

// PATCH update order status (kitchen)
router.patch('/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { status } = req.body;
  const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  order.status = status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

// DELETE cancel order
router.delete('/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = 'cancelled';
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

module.exports = router;