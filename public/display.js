let previousReadyIds = new Set();

async function loadReadyOrders() {
  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();
    const ready = orders.filter(o => o.status === 'ready');

    const grid = document.getElementById('ready-grid');
    const emptyBoard = document.getElementById('empty-board');

    if (!ready.length) {
      grid.innerHTML = '';
      emptyBoard.style.display = 'block';
      previousReadyIds = new Set();
      return;
    }

    emptyBoard.style.display = 'none';

    // Only re-render if something changed
    const newIds = new Set(ready.map(o => o.id || o._id));
    const changed = ready.some(o => !previousReadyIds.has(o.id || o._id)) ||
                    [...previousReadyIds].some(id => !newIds.has(id));

    if (!changed) return;

    grid.innerHTML = ready.map(o => {
      const itemNames = (o.items || [])
        .map(item => item.name || item)
        .join(', ');

      return `
        <div class="ready-token-card">
          <div class="ready-token-num">#${o.token || '?'}</div>
          <div class="ready-token-items">${itemNames}</div>
        </div>`;
    }).join('');

    previousReadyIds = newIds;

  } catch (err) {
    console.error('Display error:', err);
  }
}

setInterval(loadReadyOrders, 3000);
loadReadyOrders();
