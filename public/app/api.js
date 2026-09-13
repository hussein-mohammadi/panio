function initData() {
  return window.Telegram?.WebApp?.initData || '';
}

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'خطایی رخ داد.');
  }
  return data;
}

function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
}

function patch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) });
}

export const api = {
  me: () => request('/api/shops/me'),
  createShop: (name) => post('/api/shops', { name }),
  joinShop: (inviteToken) => post('/api/shops/join', { inviteToken }),

  dashboard: (shopId) => request(`/api/shops/${shopId}/dashboard`),

  products: (shopId, search) => request(`/api/shops/${shopId}/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createProduct: (shopId, payload) => post(`/api/shops/${shopId}/products`, payload),
  deleteProduct: (shopId, productId) => request(`/api/shops/${shopId}/products/${productId}`, { method: 'DELETE' }),

  quickSale: (shopId, payload) => post(`/api/shops/${shopId}/orders/quick-sale`, payload),
  orders: (shopId, status) => request(`/api/shops/${shopId}/orders${status ? `?status=${status}` : ''}`),
  order: (shopId, orderId) => request(`/api/shops/${shopId}/orders/${orderId}`),
  createOrder: (shopId, payload) => post(`/api/shops/${shopId}/orders`, payload),
  updateOrderStatus: (shopId, orderId, status) => patch(`/api/shops/${shopId}/orders/${orderId}/status`, { status }),

  customers: (shopId, search) => request(`/api/shops/${shopId}/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createCustomer: (shopId, payload) => post(`/api/shops/${shopId}/customers`, payload),
  customer: (shopId, customerId) => request(`/api/shops/${shopId}/customers/${customerId}`),

  financeTransactions: (shopId, type) => request(`/api/shops/${shopId}/finance/transactions${type ? `?type=${type}` : ''}`),
  financeReports: (shopId) => request(`/api/shops/${shopId}/finance/reports`),
  recordExpense: (shopId, payload) => post(`/api/shops/${shopId}/finance/expenses`, payload),

  plans: () => request('/api/plans'),
  subscription: (shopId) => request(`/api/shops/${shopId}/subscription`),
  checkout: (shopId, planId) => post(`/api/shops/${shopId}/subscription/checkout`, { planId }),

  members: (shopId) => request(`/api/shops/${shopId}/members`),
  createInvite: (shopId) => post(`/api/shops/${shopId}/invitations`),
};
