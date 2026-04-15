const express = require("express")
const router = express.Router()
const Razorpay = require("razorpay")
const crypto = require("crypto")

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Step 1: Create Razorpay order
router.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount } = req.body // amount in rupees

    const options = {
      amount: amount * 100,  // Razorpay uses paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    }

    const order = await razorpay.orders.create(options)
    res.json(order)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to create order" })
  }
})

// Step 2: Verify payment signature
router.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  const body = razorpay_order_id + "|" + razorpay_payment_id

const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest("hex")
  if (expectedSignature === razorpay_signature) {
    res.json({ success: true })
  } else {
    res.status(400).json({ success: false, error: "Invalid signature" })
  }
})

module.exports = router