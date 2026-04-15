// ─── State ───────────────────────────────────────────
let allFoods = [];
let cart = JSON.parse(localStorage.getItem('sc_cart') || '[]');
let currentCategory = 'All';

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadFoods();
  renderCart();
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
    const qty = cartItem ? cartItem.quantity : 0;
    const emoji = emojiMap[food.category] || '🍽️';
    const hasImg = food.image && food.image !== '/images/icon.jpg';

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

    return `
      <div class="food-card ${food.available ? '' : 'food-unavailable'}" id="food-${food.id}">
        ${imgHTML}
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
    Snacks: 'Freshly prepared, crispy & delicious',
    Beverages: 'Made fresh to order',
    Meals: 'Wholesome & filling',
    Desserts: 'Sweet treats for every mood'
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

  // Show/hide footer
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

  const name = document.getElementById('customer-name').value.trim() || 'Guest';
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  try {
    // 1. Create order in our backend
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customerName: name,
        pickupSlot: 'ASAP',
        paymentMethod: 'online'
      })
    });
    const order = await orderRes.json();

    // 2. Create Razorpay order
    const payRes = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total, orderId: order.id })
    });
    const payData = await payRes.json();

    // 3. Open Razorpay checkout
    const options = {
      key: payData.keyId,
      amount: payData.amount,
      currency: 'INR',
      name: 'Smart Canteen',
      description: `Order ${order.id || order.token}`,
      order_id: payData.razorpayOrderId,
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
          } else {
            showToast('Payment verification failed. Contact staff.', 'error');
          }
        } catch (err) {
          showToast('Verification error. Contact staff.', 'error');
        }
      },
      prefill: { name, contact: '' },
      theme: { color: '#f97316' },
      modal: { backdropclose: false }
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

  const name = document.getElementById('customer-name').value.trim() || 'Guest';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customerName: name,
        pickupSlot: 'ASAP',
        paymentMethod: 'cash'
      })
    });
    const order = await res.json();
    clearCart();
    showSuccessModal(order);
  } catch (err) {
    showToast('Failed to place order. Try again.', 'error');
  }
}

function clearCart() {
  cart = [];
  saveCart();
  renderMenu();
  renderCart();
  // Close drawer
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

// ─── Success Modal ─────────────────────────────────────
function showSuccessModal(order) {
  const tokenNum = order.token || order.id || '—';
  document.getElementById('success-token').textContent = `#${tokenNum}`;
  document.getElementById('success-details').innerHTML = `
    <p>Total: <strong>₹${order.total}</strong></p>
    <p>Payment: <strong>${order.paymentMethod === 'cash' ? 'Pay at counter' : 'Online (Paid)'}</strong></p>
  `;
  document.getElementById('success-modal').style.display = 'flex';
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
