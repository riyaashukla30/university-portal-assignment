import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Home() {
  const { userType } = useAppContext();
  return <section className="panel">
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Synthetic hiring exercise</p>
    <h1 className="mb-4 text-3xl font-semibold">Verification Workspace</h1>
    <p className="mb-4 text-slate-600">Explore the existing customer experience, then read ASSIGNMENT.md to build the university staff workspace.</p>
    <p className="mb-6">Current session: <strong>{userType || 'Signed out'}</strong></p>
    <div className="flex flex-wrap gap-3"><Link className="button" to="/my-orders">Customer orders</Link><Link className="button" to="/my-cart">Customer cart</Link><Link className="button" to="/university/dashboard">University dashboard (your task)</Link></div>
  </section>;
}
