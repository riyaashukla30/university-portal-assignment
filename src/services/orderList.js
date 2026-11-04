import api from './api';

export async function fetchOrderCases() {
  try {
    return (await api.get('/api/dbp/orders-list/')).data;
  } catch (error) {
    console.error('Unable to load orders', error.message);
    return { orders: [], count: 0 };
  }
}
