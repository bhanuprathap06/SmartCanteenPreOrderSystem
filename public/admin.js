async function loadAdmin(){
  const res    = await fetch("/orders")
  const orders = await res.json()

  // stats
  const total   = orders.length
  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const avg     = total > 0 ? Math.round(revenue / total) : 0

  // most popular item
  const itemCount = {}
  orders.forEach(o => {
    o.items.forEach(item => {
      itemCount[item] = (itemCount[item] || 0) + 1
    })
  })
  const popular = Object.keys(itemCount)
    .sort((a,b) => itemCount[b] - itemCount[a])[0] || "—"

  document.getElementById("totalOrders").innerText = total
  document.getElementById("totalRev").innerText    = "₹" + revenue
  document.getElementById("avgOrder").innerText    = "₹" + avg
  document.getElementById("popular").innerText     = popular

  // table
  const tbody = document.getElementById("ordersTableBody")
  tbody.innerHTML = ""

  if(orders.length === 0){
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:#bbb;padding:32px">
          No orders yet
        </td>
      </tr>
    `
    return
  }

  orders.forEach(o => {
    const isReady = o.status === "Ready"
    const mins    = Math.floor((Date.now() - new Date(o.createdAt)) / 60000)
    const timeAgo = mins < 1 ? "Just now" : mins + " min ago"
    const payId   = o.paymentId
      ? o.paymentId.slice(0, 14) + "..."
      : "—"

    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td><strong>#${o.token}</strong></td>
      <td>${o.items.join(", ")}</td>
      <td>₹${o.total}</td>
      <td>${timeAgo}</td>
      <td style="font-size:12px;color:#888">${payId}</td>
      <td>
        <span class="tbl-badge ${isReady ? "badge-ready" : "badge-prep"}">
          ${o.status}
        </span>
      </td>
    `
    tbody.appendChild(tr)
  })
}

// refresh every 5 seconds
setInterval(loadAdmin, 5000)
loadAdmin()