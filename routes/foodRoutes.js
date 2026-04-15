const express = require("express")
const router = express.Router()

const foods = [
 { name:"Burger", price:60 },
 { name:"Sandwich", price:40 },
 { name:"Coffee", price:20 }
]

router.get("/", (req,res)=>{
 res.json(foods)
})

module.exports = router
