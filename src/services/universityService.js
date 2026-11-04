import api from './api';
import { normalizeApplicationsResponse } from '../utils/normalizeApplicationsResponse.js';

export const PAGE_SIZE = 20;

// Calls the university mock endpoint through the shared Axios instance.
// Errors are NOT swallowed here (unlike the customer services) so the page can show them.
export async function fetchUniversityApplications({ page, search, status, scenario }, signal) {
  const response = await api.get('/api/university/applications/', {
    params: { page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined, scenario },
    signal,
  });
  return normalizeApplicationsResponse(response.data, PAGE_SIZE);
}
