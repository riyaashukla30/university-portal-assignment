import api from './api';

let activeFetchPromise = null;
let cachedData = null;
let cachedTime = 0;

export async function fetchCartCases(forceRefresh = false) {
  if (!forceRefresh && activeFetchPromise) return activeFetchPromise;
  if (!forceRefresh && cachedData && Date.now() - cachedTime < 2000) return cachedData;
  activeFetchPromise = (async () => {
    try {
      const response = await api.get('/api/dbp/case-view-list/');
      const result = { cases: response.data.results || [], count: response.data.count || 0 };
      cachedData = result;
      cachedTime = Date.now();
      return result;
    } catch (error) {
      console.error('Unable to load cart', error.message);
      return { cases: [], count: 0 };
    } finally {
      activeFetchPromise = null;
    }
  })();
  return activeFetchPromise;
}
