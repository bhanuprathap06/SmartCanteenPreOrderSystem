require("dotenv").config()  // add this as FIRST line
const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

// serve frontend
app.use(express.static(path.join(__dirname,"public")))
app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"))
})
// routes
const orderRoutes = require("./routes/orderRoutes")
app.use("/orders",orderRoutes)
const paymentRoutes = require("./routes/paymentRoutes")
app.use("/payment", paymentRoutes)

// connect mongodb
mongoose.connect("mongodb://127.0.0.1:27017/smartcanteen")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

app.listen(3000,()=>{
console.log("Server running on http://localhost:3000")
})