let cart = []
let total = 0

const TOKEN_AMOUNT = 10


/* ---------------- CART PANEL ---------------- */

function toggleCart(){

const panel = document.getElementById("cartPanel")
panel.classList.toggle("show")

renderCart()

}


/* ---------------- ADD TO CART ---------------- */

function addToCart(item, price){

// prevent spam clicking
const btn = event.target
btn.disabled = true

setTimeout(()=>{
btn.disabled = false
},500)

// add item
cart.push({
name: item,
price: price
})

total += price

document.getElementById("cartCount").innerText = cart.length

renderCart()

// cart icon animation
const cartElement = document.getElementById("cartCount")
cartElement.style.transform = "scale(1.4)"

setTimeout(()=>{
cartElement.style.transform = "scale(1)"
},200)


// toast message
const toast = document.getElementById("toast")
if(toast){
toast.classList.add("show")

setTimeout(()=>{
toast.classList.remove("show")
},1500)
}

}


/* ---------------- RENDER CART ---------------- */

function renderCart(){
  const container = document.getElementById("cartItems")
  container.innerHTML = ""

  if(cart.length === 0){
    container.innerHTML = '<div class="cart-empty">Your cart is empty</div>'
    document.getElementById("cartTotal").innerText = 0
    document.getElementById("cartCount2").innerText = 0
    return
  }

  cart.forEach((item, index) => {
    const div = document.createElement("div")
    div.className = "cartItem"
    div.innerHTML = `
      <span>${item.name} — ₹${item.price}</span>
      <button onclick="removeItem(${index})">✕</button>
    `
    container.appendChild(div)
  })

  document.getElementById("cartTotal").innerText = total
  document.getElementById("cartCount2").innerText = cart.length
}

/* ---------------- REMOVE ITEM ---------------- */

function removeItem(index){

total -= cart[index].price
cart.splice(index,1)

document.getElementById("cartCount").innerText = cart.length

renderCart()

}


/* ---------------- PLACE ORDER ---------------- */

async function placeOrder() {

  if (cart.length === 0) {
    alert("Cart is empty")
    return
  }

  const amountToPay = total + 10 // ₹10 token advance

  try {

    // Step 1: Create Razorpay order on backend
    const res = await fetch("/payment/create-razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountToPay })
    })

    const razorpayOrder = await res.json()

    if (!razorpayOrder.id) {
      alert("Payment setup failed. Try again.")
      return
    }

    // Step 2: Open Razorpay checkout popup
    const options = {
      key: "rzp_test_ScxsW50Qr8KNYo",  // your Key ID
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Smart Canteen",
      description: "Food Pre-Order",
      order_id: razorpayOrder.id,

      handler: async function (response) {

        // Step 3: Verify payment on backend
        const verify = await fetch("/payment/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response)
        })

        const result = await verify.json()

        if (result.success) {

          // Step 4: Save order to DB
          const orderRes = await fetch("/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: cart.map(i => i.name),
              total: amountToPay,
              paymentId: response.razorpay_payment_id
            })
          })

          const data = await orderRes.json()

          alert(
            "✅ Payment Successful!\n\n" +
            "Your Token: #" + data.token +
            "\n\nWait for your number on the display board!"
          )

          // Clear cart
          cart = []
          total = 0
          document.getElementById("cartCount").innerText = 0
          renderCart()
          toggleCart()

        } else {
          alert("❌ Payment verification failed! Show this to canteen staff.\nPayment ID: " + response.razorpay_payment_id)
        }

      },

      prefill: {
        name: "Student",
        contact: "9999999999"
      },

      theme: {
        color: "#111111"
      },

      modal: {
        ondismiss: function () {
          alert("Payment cancelled. Your order was not placed.")
        }
      }
    }

    const rzp = new Razorpay(options)
    rzp.open()

  } catch (err) {
    console.error(err)
    alert("Server error. Make sure backend is running.")
  }

}