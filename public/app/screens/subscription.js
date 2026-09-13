import { route } from '../router.js';
import { api } from '../api.js';
import { state, toman, showToast } from '../state.js';

const STATUS_FA = {
  TRIAL: 'دوره آزمایشی',
  ACTIVE: 'فعال',
  PAST_DUE: 'پرداخت معوق',
  GRACE_PERIOD: 'مهلت تمدید',
  CANCELLED: 'لغو شده',
  EXPIRED: 'منقضی شده',
  SUSPENDED: 'معلق',
};

function openPaymentUrl(url) {
  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(url);
  } else {
    window.location.href = url;
  }
}

async function render(outlet, { query }) {
  if (query.paid === '1') showToast('پرداخت با موفقیت انجام شد ✅');
  if (query.paid === '0') showToast('پرداخت ناموفق بود یا لغو شد.', true);

  const [subscription, plans] = await Promise.all([api.subscription(state.shopId), api.plans()]);

  outlet.innerHTML = `
    <div class="card">
      <h3>وضعیت اشتراک</h3>
      ${
        subscription.status
          ? `<p><span class="badge blue">${STATUS_FA[subscription.status] ?? subscription.status}</span> — پلن ${subscription.plan?.name ?? ''}</p>
             <p style="color:var(--muted)">${subscription.daysLeft} روز تا پایان اشتراک</p>`
          : '<p style="color:var(--muted)">اشتراکی یافت نشد.</p>'
      }
    </div>

    <div class="section-title"><h3>پلن‌ها</h3></div>
    <div id="plans"></div>
  `;

  outlet.querySelector('#plans').innerHTML = plans
    .map(
      (p) => `
      <div class="plan-card ${subscription.plan?.id === p.id ? 'current' : ''}">
        <h3>${p.name}</h3>
        <div class="plan-price">${p.price > 0 ? toman(p.price) + ' / ماه' : 'رایگان'}</div>
        <p style="color:var(--muted); font-size:0.85rem">${p.description}</p>
        ${
          p.price > 0
            ? `<button class="btn btn-primary btn-sm" data-plan="${p.id}">${subscription.plan?.id === p.id ? 'تمدید' : 'انتخاب پلن'}</button>`
            : ''
        }
      </div>`
    )
    .join('');

  outlet.querySelectorAll('[data-plan]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const result = await api.checkout(state.shopId, btn.dataset.plan);
        openPaymentUrl(result.paymentUrl);
      } catch (err) {
        showToast(err.message, true);
        btn.disabled = false;
      }
    });
  });
}

route('/subscription', 'اشتراک', render);
