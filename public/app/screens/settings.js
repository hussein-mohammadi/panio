import { route, navigate } from '../router.js';
import { api } from '../api.js';
import { state, currentShop, showToast } from '../state.js';

async function render(outlet) {
  const shop = currentShop();
  const members = await api.members(state.shopId);

  outlet.innerHTML = `
    <div class="card">
      <h3>${shop?.name ?? 'فروشگاه'}</h3>
      <p style="color:var(--muted); font-size:0.85rem">نقش شما: ${shop?.role === 'OWNER' ? 'مالک' : 'کارمند'}</p>
    </div>

    <div class="section-title" style="margin-top:0"><h3>اعضای فروشگاه</h3></div>
    <div id="members"></div>

    ${
      shop?.role === 'OWNER'
        ? `<button class="btn btn-secondary" id="inviteBtn" style="margin-top:12px">🔗 ساخت لینک دعوت</button>
           <div id="inviteResult"></div>
           <a href="#/subscription" class="btn btn-secondary" style="margin-top:12px; display:block; text-align:center">🏆 مدیریت اشتراک</a>`
        : ''
    }
  `;

  outlet.querySelector('#members').innerHTML = members
    .map(
      (m) => `
      <div class="list-row">
        <div class="thumb">👤</div>
        <div class="meta"><strong>${m.telegramUserId}</strong><small>${m.role === 'OWNER' ? 'مالک' : 'کارمند'}</small></div>
      </div>`
    )
    .join('');

  const inviteBtn = outlet.querySelector('#inviteBtn');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', async () => {
      inviteBtn.disabled = true;
      try {
        const invite = await api.createInvite(state.shopId);
        outlet.querySelector('#inviteResult').innerHTML = `
          <div class="card">
            <p style="font-size:0.85rem; color:var(--muted)">این لینک را برای عضو جدید ارسال کنید (اعتبار ۷ روز):</p>
            <input readonly value="${invite.link}" onclick="this.select()" style="width:100%; background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:10px; color:var(--text)" />
          </div>`;
      } catch (err) {
        showToast(err.message, true);
      } finally {
        inviteBtn.disabled = false;
      }
    });
  }
}

route('/settings', 'تنظیمات', render);
