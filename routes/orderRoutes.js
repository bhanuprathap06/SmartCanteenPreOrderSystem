const express = require("express")
const router = express.Router()
const Order = require("../models/Order")

router.post("/", async (req, res) => {
  console.log("Incoming order:", req.body)

  try {
    const lastOrder = await Order.findOne().sort({ token: -1 })
    let tokenNumber = 1
    if (lastOrder) tokenNumber = lastOrder.token + 1

    const order = new Order({
      token: tokenNumber,
      items: req.body.items || [],
      total: req.body.total || 0,
      paymentId: req.body.paymentId || req.body.razorpay_payment_id || "",
      razorpayOrderId: req.body.razorpay_order_id || "",
      razorpaySignature: req.body.razorpay_signature || "",
      status: "Preparing",
      createdAt: new Date()
    })

    await order.save()

    console.log("Saved order:", order)

    res.json({
      success: true,
      message: "Order placed successfully",
      token: tokenNumber,
      order
    })
  } catch (err) {
    console.error("Order creation error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json({ success: true, orders })
  } catch (err) {
    console.error("Fetch orders error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/:id", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: "Ready" })
    res.json({ success: true, message: "Order marked ready" })
  } catch (err) {
    console.error("Update order error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router