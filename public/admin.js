async function loadAdmin() {
  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();

    // ─── Stats ───────────────────────────────────────
    const total   = orders.length;
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const avg     = total > 0 ? Math.round(revenue / total) : 0;

    // Most popular item
    const itemCount = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const name = item.name || item;
        itemCount[name] = (itemCount[name] || 0) + (item.quantity || 1);
      });
    });
    const popular = Object.keys(itemCount).sort((a, b) => itemCount[b] - itemCount[a])[0] || '—';

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('totalRev').textContent    = '₹' + revenue;
    document.getElementById('avgOrder').textContent    = '₹' + avg;
    document.getElementById('popular').textContent     = popular;

    // ─── Table ────────────────────────────────────────
    const tbody = document.getElementById('ordersTableBody');

    if (!orders.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;color:var(--text2);padding:48px">
            No orders yet
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const placedTime = o.placedAt || o.createdAt;
      const mins = placedTime ? Math.floor((Date.now() - new Date(placedTime)) / 60000) : 0;
      const timeAgo = mins < 1 ? 'Just now' : mins + ' min ago';

      const itemNames = (o.items || [])
        .map(item => (item.name || item) + (item.quantity > 1 ? ` ×${item.quantity}` : ''))
        .join(', ');

      const payId = o.paymentId
        ? `<span style="font-family:monospace;font-size:0.75rem;color:var(--text2)">${o.paymentId.slice(0, 14)}…</span>`
        : `<span style="color:var(--text3)">—</span>`;

      const payMethod = o.paymentMethod === 'cash'
        ? '<span style="color:var(--yellow)">💵 Cash</span>'
        : `<span style="color:var(--green)">💳 Online</span>`;

      const badgeClass = `badge badge-${o.status || 'placed'}`;
      const statusText = statusLabel(o.status || 'placed');

      return `
        <tr>
          <td><strong style="color:var(--accent)">#${o.token || o.id}</strong></td>
          <td>${o.customerName || 'Guest'}</td>
          <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${itemNames}</td>
          <td><strong>₹${o.total || 0}</strong></td>
          <td style="color:var(--text2)">${timeAgo}</td>
          <td>${payMethod}</td>
          <td><span class="${badgeClass}">${statusText}</span></td>
        </tr>`;
    }).join('');

  } catch (err) {
    console.error(err);
    document.getElementById('ordersTableBody').innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:var(--red);padding:32px">
          ❌ Failed to load orders
        </td>
      </tr>`;
  }
}

function statusLabel(s) {
  const map = {
    placed: 'New',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    picked_up: 'Done',
    cancelled: 'Cancelled'
  };
  return map[s] || s;
}

// Auto-refresh every 5 seconds
setInterval(loadAdmin, 5000);
loadAdmin();
