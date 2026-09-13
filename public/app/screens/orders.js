import { route, navigate } from '../router.js';
import { api } from '../api.js';
import { state, toman, formatDate, showToast } from '../state.js';

const STATUS_FA = {
  NEW: ['جدید', 'blue'],
  CONFIRMED: ['تایید شده', 'purple'],
  PROCESSING: ['در حال پردازش', 'orange'],
  SHIPPED: ['ارسال شده', 'blue'],
  COMPLETED: ['تکمیل شده', 'green'],
  CANCELLED: ['لغو شده', 'red'],
};

async function renderList(outlet) {
  const orders = await api.orders(state.shopId);

  outlet.innerHTML = `
    <div class="section-title" style="margin-top:0"><h3>سفارش‌ها</h3></div>
    <div id="list"></div>
  `;

  const el = outlet.querySelector('#list');
  if (!orders.length) {
    el.innerHTML = '<div class="empty-state">هنوز سفارشی ثبت نشده است.</div>';
    return;
  }

  el.innerHTML = orders
    .map((o) => {
      const [label, color] = STATUS_FA[o.status] ?? [o.status, 'blue'];
      return `
      <a class="list-row" href="#/orders/${o.id}" style="display:flex">
        <div class="thumb">📦</div>
        <div class="meta"><strong>#${o.id.slice(-6)}</strong><small>${formatDate(o.createdAt)}</small></div>
        <div class="trail"><strong>${toman(o.finalAmount)}</strong><span class="badge ${color}">${label}</span></div>
      </a>`;
    })
    .join('');
}

async function renderDetail(outlet, { params }) {
  const { order, items } = await api.order(state.shopId, params.id);
  const [label, color] = STATUS_FA[order.status] ?? [order.status, 'blue'];

  outlet.innerHTML = `
    <div class="card">
      <div class="section-title" style="margin-top:0">
        <h3>سفارش #${order.id.slice(-6)}</h3>
        <span class="badge ${color}">${label}</span>
      </div>
      <p style="color:var(--muted); font-size:0.85rem">${formatDate(order.createdAt)}</p>
      ${items
        .map(
          (i) => `
        <div class="list-row">
          <div class="meta"><strong>${i.productNameSnapshot}</strong><small>${i.quantity} × ${toman(i.unitPrice)}</small></div>
          <div class="trail"><strong>${toman(i.total)}</strong></div>
        </div>`
        )
        .join('')}
      <div class="list-row" style="background:transparent;border:none">
        <div class="meta"><strong>جمع کل</strong></div>
        <div class="trail"><strong>${toman(order.finalAmount)}</strong></div>
      </div>
    </div>

    <div class="card">
      <h3>تغییر وضعیت</h3>
      <div class="form-group">
        <select id="statusSelect">
          ${Object.entries(STATUS_FA)
            .map(([value, [label]]) => `<option value="${value}" ${value === order.status ? 'selected' : ''}>${label}</option>`)
            .join('')}
        </select>
      </div>
      <button class="btn btn-primary" id="updateBtn">به‌روزرسانی وضعیت</button>
    </div>
  `;

  outlet.querySelector('#updateBtn').addEventListener('click', async () => {
    const status = outlet.querySelector('#statusSelect').value;
    try {
      await api.updateOrderStatus(state.shopId, order.id, status);
      showToast('وضعیت سفارش به‌روزرسانی شد ✅');
      navigate('/orders');
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

route('/orders', 'سفارش‌ها', renderList);
route('/orders/:id', 'جزئیات سفارش', renderDetail);
