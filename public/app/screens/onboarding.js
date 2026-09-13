import { route, navigate } from '../router.js';
import { api } from '../api.js';
import { state } from '../state.js';

function render(outlet) {
  outlet.innerHTML = `
    <div class="onboarding-hero">
      <div class="logo">✦</div>
      <h2>به پانیو خوش آمدید</h2>
      <p>مدیریت فروشگاه تلگرامی و اینستاگرامی شما — سفارش‌ها، محصولات، مشتریان و حساب و کتاب، همه در یک جا.</p>
    </div>

    <div class="card">
      <h3>🏪 ساخت فروشگاه جدید</h3>
      <div class="form-group">
        <label>نام فروشگاه</label>
        <input id="shopName" placeholder="مثال: فروشگاه آفتاب" />
      </div>
      <button class="btn btn-primary" id="createBtn">ساخت فروشگاه</button>
    </div>

    <div class="card">
      <h3>🔗 پیوستن به فروشگاه</h3>
      <p style="color:var(--muted); font-size:0.85rem; margin-top:0">اگر از طرف یک فروشگاه دعوت شده‌اید، کد دعوت را وارد کنید.</p>
      <div class="form-group">
        <label>کد دعوت</label>
        <input id="inviteToken" placeholder="کد دعوت" />
      </div>
      <button class="btn btn-secondary" id="joinBtn">پیوستن</button>
    </div>
  `;

  outlet.querySelector('#createBtn').addEventListener('click', async () => {
    const name = outlet.querySelector('#shopName').value.trim();
    if (!name) return;
    const btn = outlet.querySelector('#createBtn');
    btn.disabled = true;
    try {
      const shop = await api.createShop(name);
      const me = await api.me();
      state.shops = me.shops;
      state.shopId = shop.id;
      navigate('/dashboard');
      location.reload();
    } catch (err) {
      btn.disabled = false;
      alert(err.message);
    }
  });

  outlet.querySelector('#joinBtn').addEventListener('click', async () => {
    const token = outlet.querySelector('#inviteToken').value.trim();
    if (!token) return;
    const btn = outlet.querySelector('#joinBtn');
    btn.disabled = true;
    try {
      const shop = await api.joinShop(token);
      const me = await api.me();
      state.shops = me.shops;
      state.shopId = shop.id;
      navigate('/dashboard');
      location.reload();
    } catch (err) {
      btn.disabled = false;
      alert(err.message);
    }
  });
}

route('/onboarding', 'پانیو', render);
