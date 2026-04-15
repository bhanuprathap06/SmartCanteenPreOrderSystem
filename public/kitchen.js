let allOrders = [];
let currentFilter = 'active';
let refreshInterval;

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  refreshInterval = setInterval(loadOrders, 12000); // auto-refresh every 12s
});

async function loadOrders() {
  try {
    const res = await fetch('/api/orders');
    allOrders = await res.json();
    updateStats();
    renderOrders();
  } catch (e) {
    showToast('Failed to load orders', 'error');
  }
}

function updateStats() {
  const count = (status) => allOrders.filter(o => o.status === status).length;
  document.getElementById('stat-placed').textContent    = count('placed') + count('confirmed');
  document.getElementById('stat-preparing').textContent = count('preparing');
  document.getElementById('stat-ready').textContent     = count('ready');
  document.getElementById('stat-done').textContent      = count('picked_up');
}

function setFilter(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderOrders();
}

function getFilteredOrders() {
  if (currentFilter === 'active') {
    return allOrders.filter(o => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status));
  }
  if (currentFilter === 'all') return allOrders;
  return allOrders.filter(o => o.status === currentFilter);
}

function renderOrders() {
  const orders = getFilteredOrders();
  const grid = document.getElementById('orders-grid');

  if (!orders.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">🎉</div>
        <h3 style="color:var(--text);margin-bottom:6px">All clear!</h3>
        <p>No orders here</p>
      </div>`;
    return;
  }

  grid.innerHTML = orders.map(order => {
    const placedTime = order.placedAt || order.createdAt;
    const age = placedTime ? Math.floor((Date.now() - new Date(placedTime)) / 60000) : 0;
    const urgent = age > 15 && !['ready', 'picked_up', 'cancelled'].includes(order.status);

    const itemsList = order.items.map(item => `
      <div class="order-item-row">
        <span>${item.name}</span>
        <span class="order-item-qty">×${item.quantity}</span>
      </div>`).join('');

    const payIcon = order.paymentMethod === 'cash' ? '💵' : '💳';
    const payLabel = order.paymentMethod === 'cash' ? 'Cash' : 'Paid';

    return `
    <div class="order-card ${urgent ? 'urgent' : ''}">
      <div class="order-card-header">
        <div>
          <div class="order-id-label">Order ID</div>
          <div class="order-id">${order.id || '—'}</div>
          <div class="order-customer">${order.customerName || 'Guest'} · ${payIcon} ${payLabel}</div>
        </div>
        <div class="order-token-badge">#${order.token || '?'}</div>
      </div>

      <div class="order-items-list">${itemsList}</div>

      <div class="order-card-footer">
        <div class="time-chip">
          ⏱ ${age === 0 ? 'Just now' : age + 'm ago'}
          ${urgent ? ' ⚠️' : ''}
        </div>
        <span class="badge badge-${order.status}">${statusLabel(order.status)}</span>
      </div>

      <div class="order-actions">
        <select class="status-select" onchange="updateStatus('${order.id}', this.value)">
          <option value="">Update status…</option>
          <option value="confirmed">✅ Confirm</option>
          <option value="preparing">👨‍🍳 Mark Preparing</option>
          <option value="ready">🔔 Mark Ready</option>
          <option value="picked_up">✔ Picked Up</option>
          <option value="cancelled">❌ Cancel</option>
        </select>
      </div>
    </div>`;
  }).join('');
}

function statusLabel(s) {
  const map = {
    placed: 'New',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready! 🔔',
    picked_up: 'Done',
    cancelled: 'Cancelled'
  };
  return map[s] || s;
}

async function updateStatus(orderId, status) {
  if (!status || !orderId) return;
  try {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(`Order → ${statusLabel(status)}`, 'success');
    loadOrders();
  } catch (e) {
    showToast('Update failed', 'error');
  }
}

function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
