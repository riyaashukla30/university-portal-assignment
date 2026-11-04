import { applications, cartCases, orders } from './fixtures.js';

// Local exercise transport only. This is NOT a production authentication design.
const roles = ['Customer', 'University'];
function readRole(req) {
  const cookie = (req.headers.cookie || '').split(';').map(value => value.trim());
  return cookie.find(value => value.startsWith('demo_session='))?.split('=')[1];
}

export function mockMiddleware(req, res, next) {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return next();
  const send = (status, data, headers = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
    res.end(JSON.stringify(data));
  };
  const role = readRole(req);
  if (url.pathname === '/api/demo/session/' && req.method === 'POST') {
    const chosen = url.searchParams.get('role');
    if (!roles.includes(chosen)) return send(400, { error: 'Invalid demo role' });
    return send(200, { ok: true }, { 'Set-Cookie': `demo_session=${chosen}; HttpOnly; SameSite=Lax; Path=/` });
  }
  if (url.pathname === '/api/demo/session/' && req.method === 'DELETE') {
    return send(200, { ok: true }, { 'Set-Cookie': 'demo_session=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/' });
  }
  if (!roles.includes(role)) return send(401, { error: 'Please sign in' });
  if (req.method !== 'GET') return send(405, { error: 'Method not allowed' });
  if (url.pathname === '/api/auth-me/') {
    return send(200, { userType: role, user: { name: `${role} Demo`, universityName: role === 'University' ? 'Example University' : null } });
  }
  const scenario = url.searchParams.get('scenario') || 'normal';
  if (url.pathname === '/api/university/applications/' && role !== 'University') {
    return send(403, { error: 'University staff only' });
  }
  if (scenario === 'error') return setTimeout(() => send(503, { error: 'Demo service unavailable' }), 250);
  const delay = scenario === 'slow' ? 1800 : 250;
  if (url.pathname === '/api/dbp/case-view-list/') {
    return setTimeout(() => send(200, { results: cartCases, count: cartCases.length }), delay);
  }
  if (url.pathname === '/api/dbp/orders-list/') {
    return setTimeout(() => send(200, { orders, count: orders.length }), delay);
  }
  if (url.pathname === '/api/form/schema') {
    return setTimeout(() => send(200, { fields: [{ name: 'candidateName', label: 'Candidate name', type: 'text', required: true }] }), delay);
  }
  if (url.pathname === '/api/university/applications/') {
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 20);
    if (!Number.isInteger(page) || page < 1 || pageSize !== 20) return send(400, { error: 'Use page >= 1 and pageSize = 20' });
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const status = url.searchParams.get('status') || '';
    let rows = applications.filter(item => (!status || item.status === status)
      && (!search || `${item.candidateName} ${item.applicationNumber}`.toLowerCase().includes(search)));
    if (scenario === 'empty') rows = [];
    const total = rows.length;
    const payload = { applications: scenario === 'null' ? null : rows.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    if (scenario === 'missing-total-pages') delete payload.totalPages;
    return setTimeout(() => send(200, payload), delay);
  }
  return send(404, { error: 'Unknown mock endpoint' });
}
