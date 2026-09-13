import { route, navigate } from '../router.js';
import { api } from '../api.js';
import { state, toman } from '../state.js';

const STATUS_FA = {
  TRIAL: 'دوره آزمایشی',
  ACTIVE: 'فعال',
  PAST_DUE: 'پرداخت معوق',
  GRACE_PERIOD: 'مهلت تمدید',
  CANCELLED: 'لغو شده',
  EXPIRED: 'منقضی شده',
  SUSPENDED: 'معلق',
};

async function render(outlet) {
  const shop = state.shops.find((s) => s.id === state.shopId);
  const data = await api.dashboard(state.shopId);

  outlet.innerHTML = `
    <div class="section-title" style="margin-top:0">
      <h3>${shop ? shop.name : 'فروشگاه'}</h3>
      ${data.subscription ? `<span class="badge blue">${STATUS_FA[data.subscription.status] ?? data.subscription.status} · ${data.subscription.daysLeft} روز</span>` : ''}
    </div>

    <div class="money-card">
      <div class="money-top"><span>فروش امروز</span><span>💰</span></div>
      <div class="money-value">${toman(data.salesToday)}</div>
      <div class="money-meta">سود امروز: ${toman(data.profitToday)}</div>
    </div>

    <div class="stat-grid">
      <div class="stat-box"><span>سفارش امروز</span><strong>${data.ordersToday}</strong></div>
      <div class="stat-box green"><span>سود امروز</span><strong>${toman(data.profitToday)}</strong></div>
      <div class="stat-box warning"><span>موجودی کم</span><strong>${data.lowStockCount} کالا</strong></div>
    </div>

    <button class="btn btn-primary" id="quickSaleBtn">⚡ ثبت فروش سریع</button>

    ${
      data.lowStockProducts?.length
        ? `<div class="section-title"><h3>⚠️ هشدار موجودی</h3><a href="#/products">مشاهده همه</a></div>` +
          data.lowStockProducts
            .map(
              (p) => `
          <div class="list-row">
            <div class="thumb">📦</div>
            <div class="meta"><strong>${p.name}</strong><small>موجودی: ${p.stock} عدد</small></div>
          </div>`
            )
            .join('')
        : ''
    }
  `;

  outlet.querySelector('#quickSaleBtn').addEventListener('click', () => navigate('/quick-sale'));
}

route('/dashboard', 'پانیو', render);
