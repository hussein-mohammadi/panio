import { route, navigate } from '../router.js';
import { api } from '../api.js';
import { state, toman, showToast } from '../state.js';

let selectedProduct = null;

async function render(outlet) {
  selectedProduct = null;
  const products = await api.products(state.shopId);

  outlet.innerHTML = `
    <input class="search-box" id="searchBox" placeholder="جستجوی کالا..." />
    <div id="productList"></div>

    <div class="card" id="saleForm" hidden>
      <h3 id="selectedProductName"></h3>
      <div class="form-row">
        <div class="form-group">
          <label>تعداد</label>
          <input type="number" id="quantity" value="1" min="1" />
        </div>
        <div class="form-group">
          <label>مشتری (اختیاری)</label>
          <input id="customerName" placeholder="نام مشتری" />
        </div>
      </div>
      <div class="form-group">
        <label>موبایل مشتری (اختیاری)</label>
        <input id="customerMobile" placeholder="09xxxxxxxxx" />
      </div>
      <button class="btn btn-primary" id="submitBtn">ثبت فروش</button>
    </div>
  `;

  function renderList(list) {
    const container = outlet.querySelector('#productList');
    if (!list.length) {
      container.innerHTML = '<div class="empty-state">کالایی یافت نشد.</div>';
      return;
    }
    container.innerHTML = list
      .map(
        (p) => `
        <div class="list-row" data-id="${p.id}" style="cursor:pointer">
          <div class="thumb">🛍️</div>
          <div class="meta"><strong>${p.name}</strong><small>موجودی: ${p.stock} عدد</small></div>
          <div class="trail"><strong>${toman(p.sellingPrice)}</strong></div>
        </div>`
      )
      .join('');

    container.querySelectorAll('.list-row').forEach((row) => {
      row.addEventListener('click', () => {
        selectedProduct = list.find((p) => p.id === row.dataset.id);
        outlet.querySelector('#saleForm').hidden = false;
        outlet.querySelector('#selectedProductName').textContent = `${selectedProduct.name} — ${toman(selectedProduct.sellingPrice)}`;
        outlet.querySelector('#saleForm').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  renderList(products);

  outlet.querySelector('#searchBox').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderList(products.filter((p) => p.name.toLowerCase().includes(q)));
  });

  outlet.querySelector('#submitBtn').addEventListener('click', async () => {
    if (!selectedProduct) return;
    const quantity = Number(outlet.querySelector('#quantity').value) || 1;
    const customerName = outlet.querySelector('#customerName').value.trim();
    const customerMobile = outlet.querySelector('#customerMobile').value.trim();
    const btn = outlet.querySelector('#submitBtn');
    btn.disabled = true;
    try {
      await api.quickSale(state.shopId, {
        productId: selectedProduct.id,
        quantity,
        customerName: customerName || undefined,
        customerMobile: customerMobile || undefined,
      });
      showToast('فروش با موفقیت ثبت شد ✅');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, true);
      btn.disabled = false;
    }
  });
}

route('/quick-sale', 'ثبت فروش سریع', render);
