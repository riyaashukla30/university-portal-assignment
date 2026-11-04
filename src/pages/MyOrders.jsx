import { useEffect, useState } from 'react';
import { fetchOrderCases } from '../services/orderList';
import CaseListTable from '../components/CaseListTable';
import Loading from '../components/Loading';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => {
    fetchOrderCases().then(result => setOrders(result.orders)).finally(() => setLoading(false));
  }, []);
  const filtered = orders.filter(item => item.candidate_name.toLowerCase().includes(search.toLowerCase()));
  return <section className="panel">
    <h1 className="mb-4 text-2xl font-semibold">My orders</h1>
    <label className="mb-5 block">Search candidates<input className="ml-3 rounded border border-slate-300 p-2" value={search} onChange={event => setSearch(event.target.value)} /></label>
    {loading ? <Loading /> : filtered.length ? <CaseListTable cases={filtered} /> : <p>No orders found.</p>}
  </section>;
}
