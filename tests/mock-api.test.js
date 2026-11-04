import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import { mockMiddleware } from '../mock/server.js';

let server;
let base;
before(async () => {
  server = createServer((req, res) => mockMiddleware(req, res, () => {
    res.writeHead(404);
    res.end();
  }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function university(params = '') {
  return fetch(`${base}/api/university/applications/${params}`, { headers: { Cookie: 'demo_session=University' } });
}

test('session lifecycle uses an HttpOnly cookie and restores the selected role', async () => {
  const signedOut = await fetch(`${base}/api/auth-me/`);
  assert.equal(signedOut.status, 401);
  const login = await fetch(`${base}/api/demo/session/?role=University`, { method: 'POST' });
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const me = await fetch(`${base}/api/auth-me/`, { headers: { Cookie: cookie } });
  assert.equal((await me.json()).userType, 'University');
  const logout = await fetch(`${base}/api/demo/session/`, { method: 'DELETE' });
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
});

test('university endpoint rejects signed out and customer users', async () => {
  assert.equal((await fetch(`${base}/api/university/applications/`)).status, 401);
  assert.equal((await fetch(`${base}/api/university/applications/`, { headers: { Cookie: 'demo_session=Customer' } })).status, 403);
});

test('pagination retains overall totals including a short final page', async () => {
  const first = await (await university()).json();
  assert.equal(first.applications.length, 20);
  assert.equal(first.total, 47);
  assert.equal(first.totalPages, 3);
  const last = await (await university('?page=3&pageSize=20')).json();
  assert.equal(last.applications.length, 7);
  assert.equal(last.total, 47);
});

test('search and status filter the complete dataset before pagination', async () => {
  const search = await (await university('?search=avery')).json();
  assert.equal(search.total, 10);
  const status = await (await university('?status=COMPLETED')).json();
  assert.equal(status.total, 15);
  const combined = await (await university('?search=avery&status=COMPLETED')).json();
  assert.ok(combined.total > 0);
  assert.ok(combined.applications.every(item => item.candidateName.includes('Avery') && item.status === 'COMPLETED'));
  const number = await (await university('?search=UNI-DEMO-0047')).json();
  assert.equal(number.total, 1);
});

test('edge scenarios have intentionally distinct response contracts', async () => {
  const empty = await (await university('?scenario=empty')).json();
  assert.deepEqual(empty.applications, []);
  assert.equal(empty.total, 0);
  const invalid = await (await university('?scenario=null')).json();
  assert.equal(invalid.applications, null);
  assert.equal((await university('?scenario=error')).status, 503);
  const missing = await (await university('?scenario=missing-total-pages')).json();
  assert.equal('totalPages' in missing, false);
  assert.equal(missing.total, 47);
});

test('invalid pagination is a validation error and unknown endpoint is not HTML', async () => {
  assert.equal((await university('?page=0')).status, 400);
  assert.equal((await university('?pageSize=10')).status, 400);
  const missing = await fetch(`${base}/api/missing/`, { headers: { Cookie: 'demo_session=Customer' } });
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error, 'Unknown mock endpoint');
});

test('customer endpoints remain usable and expose failure scenarios for inspection', async () => {
  for (const endpoint of ['/api/dbp/case-view-list/', '/api/dbp/orders-list/', '/api/form/schema?packageId=1']) {
    const response = await fetch(`${base}${endpoint}`, { headers: { Cookie: 'demo_session=Customer' } });
    assert.equal(response.status, 200);
  }
  const failure = await fetch(`${base}/api/dbp/orders-list/?scenario=error`, { headers: { Cookie: 'demo_session=Customer' } });
  assert.equal(failure.status, 503);
});
