const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({

  token: Number,

  items: [String],

  total: Number,

  status: {
    type: String,
    default: "Preparing"
  },

  paymentId: {          // ← ADD THIS
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("Order", orderSchema)