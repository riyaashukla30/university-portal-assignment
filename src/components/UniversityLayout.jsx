import { NavLink, Outlet } from 'react-router-dom';
import DemoControls from './DemoControls';
import { useAppContext } from '../context/AppContext';

// University-only shell: no customer cart/order links.
export default function UniversityLayout() {
  const { user } = useAppContext();
  return <>
    <header className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white">
      <nav aria-label="University navigation" className="mx-auto flex max-w-6xl flex-wrap items-center gap-5">
        <span className="font-bold">{user?.universityName || 'University'} · Staff workspace</span>
        <NavLink to="/university/dashboard" className="underline-offset-4 aria-[current=page]:underline">Applications</NavLink>
        <span className="ml-auto text-sm text-slate-300">{user?.name || 'Staff'}</span>
      </nav>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-8">
      <DemoControls />
      <Outlet />
    </main>
  </>;
}
