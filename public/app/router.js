const routes = [];
let outletEl = null;
let onNavigate = () => {};

export function route(pattern, title, handler) {
  routes.push({ pattern, title, handler });
}

function matchRoute(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function navigate(path) {
  location.hash = path;
}

export function currentPath() {
  return (location.hash.slice(1) || '/').split('?')[0];
}

async function render() {
  const hash = location.hash.slice(1) || '/';
  const [path, queryString] = hash.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString || ''));

  for (const r of routes) {
    const params = matchRoute(r.pattern, path);
    if (params) {
      onNavigate(r, params, query);
      outletEl.innerHTML = '<div class="loading">در حال بارگذاری...</div>';
      try {
        await r.handler(outletEl, { params, query });
      } catch (err) {
        outletEl.innerHTML = `<div class="error-state">${(err && err.message) || 'خطایی رخ داد.'}</div>`;
      }
      window.scrollTo(0, 0);
      return;
    }
  }

  outletEl.innerHTML = '<div class="error-state">صفحه یافت نشد.</div>';
}

export function startRouter(outlet, opts = {}) {
  outletEl = outlet;
  if (opts.onNavigate) onNavigate = opts.onNavigate;
  window.addEventListener('hashchange', render);
  render();
}
