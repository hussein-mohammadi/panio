import { startRouter, navigate, currentPath } from './router.js';
import { api } from './api.js';
import { state } from './state.js';

import './screens/onboarding.js';
import './screens/dashboard.js';
import './screens/quickSale.js';
import './screens/products.js';
import './screens/orders.js';
import './screens/customers.js';
import './screens/finance.js';
import './screens/subscription.js';
import './screens/settings.js';

const TOP_LEVEL_ROUTES = ['dashboard', 'quick-sale', 'products', 'finance'];

const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
if (tg?.setHeaderColor) {
  try {
    tg.setHeaderColor('#060d33');
  } catch {
    /* older Telegram clients may not support custom header colors */
  }
}

const outlet = document.getElementById('outlet');
const bottomNav = document.getElementById('bottomNav');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const topbarTitle = document.getElementById('topbarTitle');

backBtn.addEventListener('click', () => history.back());
settingsBtn.addEventListener('click', () => navigate('/settings'));

function updateChrome(routeDef, params) {
  const topSegment = currentPath().split('/').filter(Boolean)[0] ?? 'dashboard';
  const isTopLevel = TOP_LEVEL_ROUTES.includes(topSegment) && !params?.id;

  topbarTitle.textContent = routeDef.title ?? 'پانیو';
  backBtn.hidden = isTopLevel || topSegment === 'onboarding';
  settingsBtn.hidden = topSegment === 'onboarding';
  bottomNav.hidden = topSegment === 'onboarding';

  bottomNav.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.route === topSegment);
  });

  tg?.BackButton?.[isTopLevel ? 'hide' : 'show']?.();
}

async function bootstrap() {
  let me;
  try {
    me = await api.me();
  } catch (err) {
    outlet.innerHTML = `<div class="error-state">${err.message || 'برای استفاده از پانیو، لطفاً از داخل بات تلگرام وارد شوید.'}</div>`;
    return;
  }

  state.user = me.user;
  state.shops = me.shops;

  if (!me.shops.length) {
    if (!location.hash || location.hash === '#/') navigate('/onboarding');
    startRouter(outlet, { onNavigate: updateChrome });
    return;
  }

  const savedShopId = localStorage.getItem('panio:lastShopId');
  const validSaved = me.shops.find((s) => s.id === savedShopId);
  state.shopId = (validSaved ?? me.shops[0]).id;
  localStorage.setItem('panio:lastShopId', state.shopId);

  if (!location.hash || location.hash === '#/' || location.hash === '#/onboarding') {
    navigate('/dashboard');
  }

  startRouter(outlet, { onNavigate: updateChrome });
}

bootstrap();
