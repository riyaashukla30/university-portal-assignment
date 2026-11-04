import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Navbar() {
  const { user, cartCount } = useAppContext();
  return <header className="border-b border-slate-200 bg-white px-6 py-5">
    <nav aria-label="Customer navigation" className="mx-auto flex max-w-5xl flex-wrap items-center gap-5">
      <NavLink to="/" className="font-bold">Verification Workspace</NavLink>
      <NavLink to="/my-orders">My orders</NavLink>
      <NavLink to="/my-cart">Cart ({cartCount})</NavLink>
      <span className="ml-auto text-sm text-slate-500">{user?.name || 'Customer sign in'}</span>
    </nav>
  </header>;
}
