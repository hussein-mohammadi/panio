import { route } from '../router.js';
import { api } from '../api.js';
import { state, toman, formatDate, showToast } from '../state.js';

const CATEGORY_FA = {
  SALES: 'فروش',
  REFUND: 'استرداد',
  OTHER: 'سایر',
  PRODUCT_PURCHASE: 'خرید کالا',
  SHIPPING: 'حمل‌ونقل',
  PACKAGING: 'بسته‌بندی',
  ADVERTISING: 'تبلیغات',
  SALARY: 'حقوق',
};

let activeTab = 'transactions';

async function paintTransactions(outlet) {
  const transactions = await api.financeTransactions(state.shopId);
  const el = outlet.querySelector('#tabContent');

  el.innerHTML = `
    <button class="btn btn-secondary" id="addExpenseBtn" style="margin-bottom:14px">+ ثبت هزینه</button>
    <div id="txList"></div>
  `;

  const list = el.querySelector('#txList');
  if (!transactions.length) {
    list.innerHTML = '<div class="empty-state">تراکنشی ثبت نشده است.</div>';
  } else {
    list.innerHTML = transactions
      .map((t) => {
        const isIncome = t.type === 'INCOME';
        return `
        <div class="list-row">
          <div class="thumb">${isIncome ? '💰' : '💸'}</div>
          <div class="meta"><strong>${CATEGORY_FA[t.category] ?? t.category}</strong><small>${formatDate(t.createdAt)}</small></div>
          <div class="trail"><strong style="color:${isIncome ? 'var(--green)' : 'var(--red)'}">${isIncome ? '+' : '-'}${toman(t.amount)}</strong></div>
        </div>`;
      })
      .join('');
  }

  el.querySelector('#addExpenseBtn').addEventListener('click', () => {
    el.innerHTML = `
      <div class="card">
        <h3>ثبت هزینه جدید</h3>
        <div class="form-group">
          <label>دسته‌بندی</label>
          <select id="category">
            ${['PRODUCT_PURCHASE', 'SHIPPING', 'PACKAGING', 'ADVERTISING', 'SALARY', 'OTHER']
              .map((c) => `<option value="${c}">${CATEGORY_FA[c]}</option>`)
              .join('')}
          </select>
        </div>
        <div class="form-group"><label>مبلغ (تومان)</label><input type="number" id="amount" /></div>
        <div class="form-group"><label>یادداشت</label><input id="note" /></div>
        <button class="btn btn-primary" id="saveBtn">ثبت</button>
      </div>
    `;
    el.querySelector('#saveBtn').addEventListener('click', async () => {
      const amount = Number(el.querySelector('#amount').value);
      if (!amount) {
        showToast('مبلغ الزامی است.', true);
        return;
      }
      try {
        await api.recordExpense(state.shopId, {
          category: el.querySelector('#category').value,
          amount,
          note: el.querySelector('#note').value.trim() || undefined,
        });
        showToast('هزینه ثبت شد ✅');
        paintTransactions(outlet);
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });
}

async function paintReports(outlet) {
  const reports = await api.financeReports(state.shopId);
  const el = outlet.querySelector('#tabContent');

  const row = (title, s) => `
    <div class="card">
      <h3>${title}</h3>
      <div class="stat-grid">
        <div class="stat-box green"><span>درآمد</span><strong>${toman(s.income)}</strong></div>
        <div class="stat-box"><span>هزینه</span><strong>${toman(s.expense)}</strong></div>
        <div class="stat-box"><span>سود</span><strong>${toman(s.profit)}</strong></div>
      </div>
    </div>`;

  el.innerHTML = row('امروز', reports.today) + row('این هفته', reports.week) + row('این ماه', reports.month);
}

async function render(outlet) {
  activeTab = 'transactions';
  outlet.innerHTML = `
    <div class="tabs">
      <button class="tab-btn active" data-tab="transactions">درآمد / هزینه</button>
      <button class="tab-btn" data-tab="reports">گزارش‌ها</button>
    </div>
    <div id="tabContent"></div>
  `;

  outlet.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      outlet.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      if (activeTab === 'transactions') paintTransactions(outlet);
      else paintReports(outlet);
    });
  });

  await paintTransactions(outlet);
}

route('/finance', 'حساب و کتاب', render);
