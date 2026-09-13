export const state = {
  user: null,
  shops: [],
  shopId: null,
};

export function currentShop() {
  return state.shops.find((s) => s.id === state.shopId) || null;
}

export function toman(amount) {
  return `${Number(amount ?? 0).toLocaleString('fa-IR')} تومان`;
}

export function formatDate(isoOrDate) {
  try {
    return new Date(isoOrDate).toLocaleDateString('fa-IR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function showToast(message, isError = false) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `toast${isError ? ' error' : ''}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
