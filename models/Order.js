const express = require("express")
const router = express.Router()
const Order = require("../models/Order")


// -----------------------------
// PLACE ORDER (Generate Token)
// -----------------------------
router.post("/", async (req, res) => {

console.log("Incoming order:", req.body)

try {

const lastOrder = await Order.findOne().sort({ token: -1 })

let tokenNumber = 1

if (lastOrder) {
tokenNumber = lastOrder.token + 1
}

const order = new Order({
  token: tokenNumber,
  items: req.body.items,
  total: req.body.total,
  paymentId: req.body.paymentId || "",  // ← ADD THIS
  status: "Preparing",
  createdAt: new Date()
})

await order.save()

console.log("Saved order:", order)

res.json({
message: "Order placed successfully",
token: tokenNumber
})

} catch (err) {

console.error("Order creation error:", err)

res.status(500).json({
error: "Server error"
})

}

})


// -----------------------------
// GET ALL ORDERS (Kitchen)
// -----------------------------
router.get("/", async (req, res) => {

try {

const orders = await Order.find()
.sort({ createdAt: -1 })

res.json(orders)

} catch (err) {

console.error("Fetch orders error:", err)

res.status(500).json({
error: "Server error"
})

}

})


// -----------------------------
// MARK ORDER READY
// -----------------------------
router.put("/:id", async (req, res) => {

try {

await Order.findByIdAndUpdate(
req.params.id,
{ status: "Ready" }
)

res.json({
message: "Order marked ready"
})

} catch (err) {

console.error("Update order error:", err)

res.status(500).json({
error: "Server error"
})

}

})


module.exports = router
