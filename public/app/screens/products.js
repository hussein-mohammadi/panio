import { route, navigate } from '../router.js';
import { api } from '../api.js';
import { state, toman, showToast } from '../state.js';

async function renderList(outlet) {
  const products = await api.products(state.shopId);

  outlet.innerHTML = `
    <div class="section-title" style="margin-top:0">
      <h3>محصولات</h3>
      <a href="#/products/new">+ افزودن کالا</a>
    </div>
    <input class="search-box" id="searchBox" placeholder="جستجوی کالا..." />
    <div id="list"></div>
  `;

  function paint(list) {
    const el = outlet.querySelector('#list');
    if (!list.length) {
      el.innerHTML = '<div class="empty-state">هنوز کالایی ثبت نشده است.</div>';
      return;
    }
    el.innerHTML = list
      .map(
        (p) => `
        <div class="list-row">
          <div class="thumb">🛍️</div>
          <div class="meta"><strong>${p.name}</strong><small>${p.sku} · موجودی: ${p.stock}</small></div>
          <div class="trail">
            <strong>${toman(p.sellingPrice)}</strong>
            ${p.stock <= p.lowStockThreshold ? '<span class="badge orange">کم</span>' : ''}
          </div>
        </div>`
      )
      .join('');
  }

  paint(products);
  outlet.querySelector('#searchBox').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    paint(products.filter((p) => p.name.toLowerCase().includes(q)));
  });
}

async function renderNew(outlet) {
  outlet.innerHTML = `
    <div class="card">
      <h3>افزودن کالای جدید</h3>
      <div class="form-group"><label>نام کالا</label><input id="name" placeholder="مثال: تیشرت سفید" /></div>
      <div class="form-group"><label>کد کالا (SKU)</label><input id="sku" placeholder="مثال: TS-001" /></div>
      <div class="form-row">
        <div class="form-group"><label>قیمت خرید</label><input type="number" id="purchasePrice" value="0" /></div>
        <div class="form-group"><label>قیمت فروش</label><input type="number" id="sellingPrice" value="0" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>موجودی</label><input type="number" id="stock" value="0" /></div>
        <div class="form-group"><label>حد هشدار موجودی</label><input type="number" id="lowStockThreshold" value="0" /></div>
      </div>
      <button class="btn btn-primary" id="submitBtn">ثبت کالا</button>
    </div>
  `;

  outlet.querySelector('#submitBtn').addEventListener('click', async () => {
    const payload = {
      name: outlet.querySelector('#name').value.trim(),
      sku: outlet.querySelector('#sku').value.trim(),
      purchasePrice: Number(outlet.querySelector('#purchasePrice').value) || 0,
      sellingPrice: Number(outlet.querySelector('#sellingPrice').value) || 0,
      stock: Number(outlet.querySelector('#stock').value) || 0,
      lowStockThreshold: Number(outlet.querySelector('#lowStockThreshold').value) || 0,
    };
    if (!payload.name || !payload.sku) {
      showToast('نام و کد کالا الزامی است.', true);
      return;
    }
    const btn = outlet.querySelector('#submitBtn');
    btn.disabled = true;
    try {
      await api.createProduct(state.shopId, payload);
      showToast('کالا با موفقیت ثبت شد ✅');
      navigate('/products');
    } catch (err) {
      showToast(err.message, true);
      btn.disabled = false;
    }
  });
}

route('/products', 'محصولات', renderList);
route('/products/new', 'افزودن کالا', renderNew);
