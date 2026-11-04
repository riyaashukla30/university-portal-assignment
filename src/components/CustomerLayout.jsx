import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DemoControls from './DemoControls';

// Same markup App.jsx used before, moved here unchanged so customer pages look/behave the same.
export default function CustomerLayout() {
  return <>
    <Navbar />
    <main className="mx-auto max-w-5xl px-4 py-8">
      <DemoControls />
      <Outlet />
    </main>
  </>;
}
