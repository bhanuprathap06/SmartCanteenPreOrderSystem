async function loadOrders(){
  const res = await fetch("/orders")
  const orders = await res.json()

  const container = document.getElementById("orders")
  container.innerHTML = ""

  // stats
  const pending = orders.filter(o => o.status === "Preparing")
  const ready   = orders.filter(o => o.status === "Ready")
  const revenue = orders.reduce((sum, o) => sum + o.total, 0)

  document.getElementById("pendingCount").innerText = pending.length
  document.getElementById("readyCount").innerText   = ready.length
  document.getElementById("totalRevenue").innerText = "₹" + revenue

  if(orders.length === 0){
    container.innerHTML = `
      <div style="text-align:center;padding:80px 32px;color:#bbb;font-size:16px">
        No orders yet — waiting for students!
      </div>
    `
    return
  }

  // sort — preparing first
  const sorted = [...pending, ...ready]

  sorted.forEach(o => {
    const isReady = o.status === "Ready"
    const mins    = Math.floor((Date.now() - new Date(o.createdAt)) / 60000)
    const timeAgo = mins < 1 ? "Just now" : mins + " min ago"

    const div = document.createElement("div")
    div.className = "orderCard" + (isReady ? " ready-card" : "")
    div.innerHTML = `
      <div class="token">#${o.token}</div>
      <div class="items">${o.items.join(", ")}</div>
      <div class="total">₹${o.total}</div>
      <div class="order-time">${timeAgo}</div>
      <div class="status ${isReady ? "ready" : "preparing"}">
        ${isReady ? "✅ Ready" : "⏳ Preparing"}
      </div>
      <button
        onclick="markReady('${o._id}')"
        ${isReady ? 'class="done-btn"' : ""}
      >
        ${isReady ? "Collected ✓" : "Mark Ready"}
      </button>
    `
    container.appendChild(div)
  })
}

async function markReady(id){
  await fetch("/orders/" + id, { method: "PUT" })
  loadOrders()
}

setInterval(loadOrders, 2000)
loadOrders()