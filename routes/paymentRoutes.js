const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY SECRET:", process.env.RAZORPAY_KEY_SECRET);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
// POST /api/payment/create-order
// Creates a Razorpay order and returns order details + key
router.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payment/verify
// Verifies Razorpay payment signature
router.post('/verify', (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  const crypto = require('crypto');

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {

    // ⭐ UPDATE ORDER HERE
    const { orders } = require('../models/db');
    const order = orders.find(o => o.id === orderId);

    if (order) {
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.razorpayPaymentId = razorpay_payment_id;
      order.updatedAt = new Date().toISOString();
    }

    return res.json({ success: true });
  }

  return res.status(400).json({ success: false });
});

// Legacy route aliases (backwards compat)
router.post('/create-razorpay-order', async (req, res) => {
  req.url = '/create-order';
  router.handle(req, res);
});

module.exports = router;
