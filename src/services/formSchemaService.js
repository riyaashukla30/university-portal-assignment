import api from './api';

export function fetchFormSchema(packageId) {
  return api.get('/api/form/schema', { params: { packageId } });
}
