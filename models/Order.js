const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({
  token: { type: Number, required: true },
  items: { type: Array, default: [] },
  total: { type: Number, required: true },
  paymentId: { type: String, default: "" },
  razorpayOrderId: { type: String, default: "" },
  razorpaySignature: { type: String, default: "" },
  status: { type: String, default: "Preparing" },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Order", OrderSchema)