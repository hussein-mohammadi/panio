import { route, navigate } from '../router.js';
import { api } from '../api.js';
import { state, formatDate, showToast } from '../state.js';

async function renderList(outlet) {
  const customers = await api.customers(state.shopId);

  outlet.innerHTML = `
    <div class="section-title" style="margin-top:0">
      <h3>مشتریان</h3>
      <a href="#/customers/new">+ افزودن مشتری</a>
    </div>
    <input class="search-box" id="searchBox" placeholder="جستجوی مشتری..." />
    <div id="list"></div>
  `;

  function paint(list) {
    const el = outlet.querySelector('#list');
    if (!list.length) {
      el.innerHTML = '<div class="empty-state">هنوز مشتری‌ای ثبت نشده است.</div>';
      return;
    }
    el.innerHTML = list
      .map(
        (c) => `
        <a class="list-row" href="#/customers/${c.id}" style="display:flex">
          <div class="thumb">👤</div>
          <div class="meta"><strong>${c.name}</strong><small>${c.mobile ?? 'بدون شماره'}</small></div>
        </a>`
      )
      .join('');
  }

  paint(customers);
  outlet.querySelector('#searchBox').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    paint(customers.filter((c) => c.name.toLowerCase().includes(q) || (c.mobile ?? '').includes(q)));
  });
}

async function renderDetail(outlet, { params }) {
  const customer = await api.customer(state.shopId, params.id);
  outlet.innerHTML = `
    <div class="card">
      <h3>${customer.name}</h3>
      <p style="color:var(--muted)">${customer.mobile ?? 'بدون شماره'}</p>
      <p style="color:var(--muted); font-size:0.8rem">عضو از ${formatDate(customer.createdAt)}</p>
      ${customer.note ? `<p>${customer.note}</p>` : ''}
    </div>
  `;
}

async function renderNew(outlet) {
  outlet.innerHTML = `
    <div class="card">
      <h3>افزودن مشتری</h3>
      <div class="form-group"><label>نام</label><input id="name" /></div>
      <div class="form-group"><label>موبایل</label><input id="mobile" placeholder="09xxxxxxxxx" /></div>
      <div class="form-group"><label>یادداشت</label><textarea id="note" rows="3"></textarea></div>
      <button class="btn btn-primary" id="submitBtn">ثبت مشتری</button>
    </div>
  `;

  outlet.querySelector('#submitBtn').addEventListener('click', async () => {
    const name = outlet.querySelector('#name').value.trim();
    if (!name) {
      showToast('نام مشتری الزامی است.', true);
      return;
    }
    try {
      await api.createCustomer(state.shopId, {
        name,
        mobile: outlet.querySelector('#mobile').value.trim() || undefined,
        note: outlet.querySelector('#note').value.trim() || undefined,
      });
      showToast('مشتری با موفقیت ثبت شد ✅');
      navigate('/customers');
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

route('/customers', 'مشتریان', renderList);
route('/customers/new', 'افزودن مشتری', renderNew);
route('/customers/:id', 'جزئیات مشتری', renderDetail);
