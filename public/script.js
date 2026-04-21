// ─── State ───────────────────────────────────────────
let allFoods = [];
let cart = JSON.parse(localStorage.getItem('sc_cart') || '[]');
let currentCategory = 'All';

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadFoods();
  renderCart();
  generatePickupSlots();
  renderFavouriteStrip();        // ★ NEW
  showNotifBannerIfNeeded();     // ★ NEW
});

// ─── Load Foods from API ───────────────────────────────
async function loadFoods() {
  try {
    const res = await fetch('/api/foods');
    allFoods = await res.json();
    buildCategoryTabs();
    renderMenu();
  } catch (e) {
    document.getElementById('menu-grid').innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Could not load menu</h3>
        <p>Please refresh the page</p>
      </div>`;
  }
}

// ─── Category Tabs ─────────────────────────────────────
function buildCategoryTabs() {
  const cats = ['All', ...new Set(allFoods.map(f => f.category))];
  const container = document.getElementById('category-tabs');
  container.innerHTML = cats.map(c =>
    `<button class="tab-btn ${c === 'All' ? 'active' : ''}" data-cat="${c}" onclick="filterCategory(this)">${c}</button>`
  ).join('');
}

function filterCategory(btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCategory = btn.dataset.cat;
  renderMenu();
}

// ─── Render Menu ───────────────────────────────────────
function renderMenu() {
  const foods = currentCategory === 'All'
    ? allFoods
    : allFoods.filter(f => f.category === currentCategory);

  const grid = document.getElementById('menu-grid');
  if (!foods.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">🍽️</div>
        <p>No items in this category</p>
      </div>`;
    return;
  }

  const emojiMap = { Snacks: '🍔', Beverages: '☕', Meals: '🍛', Desserts: '🍮' };
  const tagMap   = { Snacks: 'Best Seller', Beverages: 'Hot', Meals: 'Popular', Desserts: 'Sweet' };
  const tagClass = { Snacks: 'tag-bestseller', Beverages: 'tag-hot', Meals: 'tag-veg', Desserts: 'tag-veg' };

  grid.innerHTML = foods.map(food => {
    const cartItem = cart.find(c => c.id === food.id);
    const qty      = cartItem ? cartItem.quantity : 0;
    const emoji    = emojiMap[food.category] || '🍽️';
    const hasImg   = food.image && food.image !== '/images/icon.jpg';
    const favoured = isFavourite(food.name); // ★ NEW

    const imgHTML = hasImg
      ? `<div class="food-img-wrap"><img src="${food.image}" alt="${food.name}" loading="lazy" /></div>`
      : `<div class="food-img-placeholder">${emoji}</div>`;

    const tagHTML = `<span class="food-tag ${tagClass[food.category] || 'tag-veg'}">${tagMap[food.category] || food.category}</span>`;

    const actionHTML = qty === 0
      ? `<button class="add-btn" onclick="addToCart('${food.id}')">+ Add</button>`
      : `<div class="qty-controls">
           <button class="qty-btn" onclick="changeQty('${food.id}', -1)">−</button>
           <span class="qty-num">${qty}</span>
           <button class="qty-btn" onclick="changeQty('${food.id}', 1)">+</button>
         </div>`;

    // ★ NEW: fav button injected into each card
    const favBtn = `
      <button
        class="fav-btn ${favoured ? 'active' : ''}"
        onclick="toggleFavourite('${food.name}', this)"
        title="${favoured ? 'Remove from favourites' : 'Add to favourites'}"
      >${favoured ? '❤️' : '🤍'}</button>`;

    return `
      <div class="food-card ${food.available ? '' : 'food-unavailable'}" id="food-${food.id}" data-name="${food.name}">
        <div style="position:relative">
          ${imgHTML}
          ${favBtn}
        </div>
        <div class="food-body">
          <div class="food-tags">${tagHTML}</div>
          <div class="food-name">${food.name}</div>
          <div class="food-desc">${food.description || getCategoryDesc(food.category)}</div>
          <div class="food-meta">⏱ ${food.prepTime || 10} min prep</div>
          <div class="food-footer">
            <span class="food-price">₹${food.price}</span>
            ${food.available ? actionHTML : '<span style="font-size:0.8rem;color:var(--red)">Unavailable</span>'}
          </div>
        </div>
      </div>`;
  }).join('');
}

function getCategoryDesc(cat) {
  const map = {
    Snacks:    'Freshly prepared, crispy & delicious',
    Beverages: 'Made fresh to order',
    Meals:     'Wholesome & filling',
    Desserts:  'Sweet treats for every mood'
  };
  return map[cat] || 'Freshly prepared daily';
}

// ─── Cart Operations ──────────────────────────────────
function addToCart(id) {
  const food = allFoods.find(f => f.id === id);
  if (!food || !food.available) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id: food.id, name: food.name, price: food.price, quantity: 1, image: food.image });
  saveCart();
  renderMenu();
  renderCart();
  showToast(`${food.name} added to cart`, 'success');
}

function changeQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  saveCart();
  renderMenu();
  renderCart();
}

function renderCart() {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  document.getElementById('cart-count').textContent = count;
  if (document.getElementById('cart-total')) {
    document.getElementById('cart-total').textContent = total;
  }

  const footer = document.getElementById('cart-footer');
  if (footer) footer.style.display = cart.length > 0 ? 'block' : 'none';

  const container = document.getElementById('cart-items');
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <span>🛒</span>
        <p>Your cart is empty</p>
      </div>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} each</div>
      </div>
      <div class="qty-controls" style="flex-shrink:0">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="qty-num">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
      <span class="cart-item-total">₹${item.price * item.quantity}</span>
    </div>
  `).join('');
}

function saveCart() {
  localStorage.setItem('sc_cart', JSON.stringify(cart));
}

function toggleCart() {
  document.getElementById('cart-drawer').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}

// ─── Checkout with Razorpay ────────────────────────────
async function checkout() {
  if (!cart.length) return showToast('Your cart is empty!', 'error');

  const name       = document.getElementById('customer-name').value.trim() || 'Guest';
  const pickupSlot = document.getElementById('pickup-slot')?.value || 'ASAP';
  const groupSize  = document.getElementById('group-size')?.value || '1';
  const total      = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  try {
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customerName: name,
        pickupSlot,
        groupSize,
        paymentMethod: 'online'
      })
    });
    const order = await orderRes.json();

    const payRes = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total, orderId: order.id })
    });
    const payData = await payRes.json();

    const options = {
      key:         payData.key,
      amount:      payData.amount,
      currency:    'INR',
      name:        'Smart Canteen',
      description: `Order ${order.id || order.token}`,
      order_id:    payData.order.id,
      handler: async function (response) {
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, orderId: order.id })
          });
          const verify = await verifyRes.json();
          if (verify.success) {
            clearCart();
            showSuccessModal(order);
            onOrderSuccess(order); // ★ NEW
          } else {
            showToast('Payment verification failed. Contact staff.', 'error');
          }
        } catch (err) {
          showToast('Verification error. Contact staff.', 'error');
        }
      },
      prefill: { name, contact: '' },
      theme:   { color: '#f97316' },
      modal:   { backdropclose: false }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', () => showToast('Payment failed. Try again.', 'error'));
    rzp.open();

  } catch (err) {
    console.error(err);
    showToast('Something went wrong. Please try again.', 'error');
  }
}

// ─── Cash Checkout ─────────────────────────────────────
async function checkoutCash() {
  if (!cart.length) return showToast('Your cart is empty!', 'error');

  const name       = document.getElementById('customer-name').value.trim() || 'Guest';
  const pickupSlot = document.getElementById('pickup-slot')?.value || 'ASAP';
  const groupSize  = document.getElementById('group-size')?.value || '1';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customerName: name,
        pickupSlot,
        groupSize,
        paymentMethod: 'cash'
      })
    });
    const order = await res.json();
    clearCart();
    showSuccessModal(order);
    onOrderSuccess(order); // ★ NEW

  } catch (err) {
    showToast('Failed to place order. Try again.', 'error');
  }
}

function clearCart() {
  cart = [];
  saveCart();
  renderMenu();
  renderCart();
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

// ─── Success Modal ─────────────────────────────────────
function showSuccessModal(order) {
  const tokenNum = order.token || order.id || '—';

  document.getElementById('success-token').textContent = `#${tokenNum}`;
  document.getElementById('success-details').innerHTML = `
    <p>Total: <strong>₹${order.total}</strong></p>
    <p>Pickup Slot: <strong>${order.pickupSlot}</strong></p>
    <p>Group Order: <strong>${order.groupSize || 1} people</strong></p>
    <p>Payment: <strong>${order.paymentMethod === 'cash' ? 'Pay at counter' : 'Online (Paid)'}</strong></p>
  `;

  // ★ NEW: hide "Notify me" button if already granted
  const notifyBtn = document.getElementById('notify-me-btn');
  if (notifyBtn) {
    notifyBtn.style.display =
      (typeof Notification !== 'undefined' && Notification.permission === 'granted')
        ? 'none' : 'block';
  }

  document.getElementById('success-modal').style.display = 'flex';
  startLiveOrderDemo();
}

function closeSuccessModal() {
  document.getElementById('success-modal').style.display = 'none';
}

// ─── Toast ─────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ─── Order Popup ──────────────────────────────────────
function toggleOrderPopup() {
  const popup   = document.getElementById('order-popup');
  const overlay = document.getElementById('order-popup-overlay');
  const isOpen  = popup.style.display === 'block';
  popup.style.display   = isOpen ? 'none' : 'block';
  overlay.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    generatePickupSlots();
    renderOrderPopup();
  }
}

function renderOrderPopup() {
  const container   = document.getElementById('popup-order-content');
  const totalEl     = document.getElementById('popup-cart-total');

  if (!cart.length) {
    container.innerHTML = `<p style="color:var(--text2)">Your cart is empty</p>`;
    totalEl.innerText = 0;
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <div style="margin-bottom:14px;padding:14px;background:#1d1d1d;border-radius:14px;">
        <strong>${item.name}</strong><br>
        Qty: ${item.quantity}<br>
        ₹${itemTotal}
      </div>`;
  }).join('');
  totalEl.innerText = total;
}

// ─── Pickup Slots ─────────────────────────────────────
function generatePickupSlots() {
  const slotSelect = document.getElementById('pickup-slot');
  slotSelect.innerHTML = '';
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  const mins = now.getMinutes();
  now.setMinutes(Math.ceil(mins / 5) * 5);

  const formatTime = (date) => {
    let hours   = date.getHours();
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let ampm    = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  for (let i = 0; i < 6; i++) {
    const start = new Date(now);
    start.setMinutes(now.getMinutes() + i * 15);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 15);
    const option = document.createElement('option');
    option.value = option.textContent = `${formatTime(start)} - ${formatTime(end)}`;
    slotSelect.appendChild(option);
  }
}

// ─── Live Order Tracker ───────────────────────────────
function updateLiveOrderFlow(status) {
  document.querySelectorAll('.track-step').forEach(s => s.classList.remove('active'));
  const steps = { placed: ['step-placed'], preparing: ['step-placed','step-preparing'], ready: ['step-placed','step-preparing','step-ready'], picked_up: ['step-placed','step-preparing','step-ready','step-delivered'] };
  (steps[status] || []).forEach(id => document.getElementById(id)?.classList.add('active'));
}
updateLiveOrderFlow('placed');

function startLiveOrderDemo() {
  updateLiveOrderFlow('placed');
  setTimeout(() => updateLiveOrderFlow('preparing'), 3000);
  setTimeout(() => updateLiveOrderFlow('ready'),     6000);
  setTimeout(() => updateLiveOrderFlow('picked_up'), 9000);
}

// ══════════════════════════════════════════════════════
// ★ FEATURE 1 — FAVOURITES
// ══════════════════════════════════════════════════════
function getFavourites() {
  return JSON.parse(localStorage.getItem('sc_favourites') || '[]');
}
function saveFavourites(favs) {
  localStorage.setItem('sc_favourites', JSON.stringify(favs));
}

function isFavourite(itemName) {
  return getFavourites().includes(itemName);
}

function toggleFavourite(itemName, btnEl) {
  let favs = getFavourites();
  const idx = favs.indexOf(itemName);
  if (idx === -1) {
    favs.push(itemName);
    if (btnEl) { btnEl.classList.add('active'); btnEl.textContent = '❤️'; }
    showToast('❤️ Added to favourites', 'success');
  } else {
    favs.splice(idx, 1);
    if (btnEl) { btnEl.classList.remove('active'); btnEl.textContent = '🤍'; }
    showToast('Removed from favourites', 'info');
  }
  saveFavourites(favs);
  renderFavouriteStrip();
}

function renderFavouriteStrip() {
  const favs    = getFavourites();
  const section = document.getElementById('favourites-section');
  const scroll  = document.getElementById('fav-scroll');
  if (!section || !scroll) return;
  if (!favs.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  scroll.innerHTML = favs.map(name => `
    <div class="fav-chip" onclick="scrollToItem('${name}')">❤️ ${name}</div>
  `).join('');
}

function scrollToItem(name) {
  // First switch to All category so the item is visible
  currentCategory = 'All';
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === 'All');
  });
  renderMenu();

  // Then scroll after a short delay to allow render
  setTimeout(() => {
    const cards = document.querySelectorAll('.food-card');
    for (const card of cards) {
      const title = card.querySelector('.food-name');
      if (title && title.textContent.trim().toLowerCase() === name.toLowerCase()) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.outline = '2px solid #f97316';
        setTimeout(() => card.style.outline = '', 1500);
        return;
      }
    }
  }, 100);
}

// ══════════════════════════════════════════════════════
// ★ FEATURE 2 — ORDER HISTORY
// ══════════════════════════════════════════════════════
function getOrderHistory() {
  return JSON.parse(localStorage.getItem('sc_order_history') || '[]');
}

function saveOrderToHistory(order) {
  const history = getOrderHistory();
  const entry = {
    date:          new Date().toLocaleString(),
    status:        'Delivered',
    total:         order.total,
    items:         (order.items || cart).map(i => ({
                     name:  i.name,
                     qty:   i.quantity,
                     price: i.price
                   })),
    pickupSlot:    order.pickupSlot || '',
    paymentMethod: order.paymentMethod || 'cash'
  };
  history.unshift(entry);
  if (history.length > 20) history.pop();
  localStorage.setItem('sc_order_history', JSON.stringify(history));
}

function openHistory() {
  renderHistory();
  document.getElementById('history-panel').classList.add('open');
  document.getElementById('history-overlay').classList.add('open');
}
function closeHistory() {
  document.getElementById('history-panel').classList.remove('open');
  document.getElementById('history-overlay').classList.remove('open');
}

function renderHistory() {
  const body    = document.getElementById('history-body');
  const history = getOrderHistory();
  if (!history.length) {
    body.innerHTML = `
      <div class="history-empty">
        🍽️ No orders yet<br>
        <span style="font-size:0.8rem">Your past orders will show up here</span>
      </div>`;
    return;
  }
  body.innerHTML = history.map((order, i) => `
    <div class="history-card">
      <div class="history-card-top">
        <div class="history-date">🗓 ${order.date}</div>
        <div class="history-status ${order.status === 'Delivered' ? 'delivered' : 'pending'}">
          ${order.status}
        </div>
      </div>
      <div class="history-items">
        ${(order.items || []).map(it => `${it.qty}× ${it.name}`).join('<br>')}
      </div>
      <div class="history-footer">
        <div class="history-total">₹${order.total}</div>
        <button class="reorder-btn" onclick="reorder(${i})">🔁 Reorder</button>
      </div>
    </div>
  `).join('');
}

function reorder(index) {
  const order = getOrderHistory()[index];
  if (!order || !order.items) return;
  order.items.forEach(it => {
    // Find the food in allFoods to get the id
    const food = allFoods.find(f => f.name === it.name);
    if (!food) return;
    const existing = cart.find(c => c.id === food.id);
    if (existing) existing.quantity += it.qty;
    else cart.push({ id: food.id, name: food.name, price: food.price, quantity: it.qty, image: food.image });
  });
  saveCart();
  renderMenu();
  renderCart();
  closeHistory();
  showToast('Items added to cart 🛒', 'success');
}

// ══════════════════════════════════════════════════════
// ★ FEATURE 3 — PWA PUSH NOTIFICATIONS
// ══════════════════════════════════════════════════════
function showNotifBannerIfNeeded() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default' && !localStorage.getItem('sc_notif_dismissed')) {
    document.getElementById('notif-banner')?.classList.add('show');
  }
  if (Notification.permission === 'granted') {
    document.getElementById('notify-me-btn') &&
      (document.getElementById('notify-me-btn').style.display = 'none');
  }
}

function dismissNotifBanner() {
  document.getElementById('notif-banner')?.classList.remove('show');
  localStorage.setItem('sc_notif_dismissed', '1');
}

function requestNotifPermission() {
  if (!('Notification' in window)) {
    showToast('Notifications not supported on this browser', 'error');
    return;
  }
  Notification.requestPermission().then(permission => {
    dismissNotifBanner();
    const btn = document.getElementById('notify-me-btn');
    if (permission === 'granted') {
      showToast('🔔 You\'ll be notified when your order is ready!', 'success');
      if (btn) btn.style.display = 'none';
    } else {
      showToast('Notifications blocked — enable in browser settings', 'info');
    }
  });
}

function scheduleReadyNotification(tokenNumber, delayMs) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  setTimeout(() => {
    new Notification('🍽️ Smart Canteen', {
      body: `Token #${tokenNumber} — Your order is ready for pickup!`,
      icon: './images/icon.jpg',
      tag:  'order-ready'
    });
  }, delayMs || 5 * 60 * 1000); // default 5 min
}

// ══════════════════════════════════════════════════════
// ★ MASTER HOOK — called after every successful order
//   (already wired into checkout() and checkoutCash())
// ══════════════════════════════════════════════════════
function onOrderSuccess(order) {
  saveOrderToHistory(order);                                      // saves to history
  scheduleReadyNotification(order.token || order.id, 3 * 60 * 1000); // notify in 3 min (demo)
}