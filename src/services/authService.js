import api from './api';

export async function getSession() {
  const response = await api.get('/api/auth-me/');
  return response.data;
}

export function startDemoSession(role) {
  return api.post('/api/demo/session/', null, { params: { role } });
}

export function endDemoSession() {
  return api.delete('/api/demo/session/');
}
