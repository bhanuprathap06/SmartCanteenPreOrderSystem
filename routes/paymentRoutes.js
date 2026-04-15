const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payment/create-order
// Creates a Razorpay order and returns order details + key
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    const options = {
      amount:   Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt:  'receipt_' + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json({
      keyId:          process.env.RAZORPAY_KEY_ID,
      amount:         order.amount,
      razorpayOrderId: order.id
    });

  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /api/payment/verify
// Verifies Razorpay payment signature
router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Invalid signature' });
  }
});

// Legacy route aliases (backwards compat)
router.post('/create-razorpay-order', async (req, res) => {
  req.url = '/create-order';
  router.handle(req, res);
});

module.exports = router;
