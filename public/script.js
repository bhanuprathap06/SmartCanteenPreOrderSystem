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
      key: "rzp_test_ScxsW50Qr8KNYo",
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

          // ✅ FIXED: correct route
          const orderRes = await fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: cart.map(i => i.name),
              total: amountToPay,
              paymentId: response.razorpay_payment_id
            })
          })

          const data = await orderRes.json()

          // ✅ DEBUG (optional but useful)
          console.log("Order API response:", data)

          // ✅ SAFE TOKEN DISPLAY
          alert(
            "✅ Payment Successful!\n\n" +
            "Your Token: #" + (data.token || "Not Generated") +
            "\n\nWait for your number on the display board!"
          )

          // Clear cart
          cart = []
          total = 0
          document.getElementById("cartCount").innerText = 0
          renderCart()
          toggleCart()

        } else {
          alert("❌ Payment verification failed!\nPayment ID: " + response.razorpay_payment_id)
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