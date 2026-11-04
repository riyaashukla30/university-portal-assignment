import { useState } from 'react';
import { startDemoSession, endDemoSession } from '../services/authService';

export default function DemoControls() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function changeSession(role) {
    setBusy(true);
    setError('');
    try {
      if (role) await startDemoSession(role); else await endDemoSession();
      window.location.reload();
    } catch {
      setError('Unable to change demo session. Is the Vite server running?');
      setBusy(false);
    }
  }
  return <aside className="mb-6 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm" aria-label="Demo controls">
    <p className="mb-3 font-semibold">Local demo sessions (not production login)</p>
    <div className="flex flex-wrap gap-2">
      <button disabled={busy} className="button" onClick={() => changeSession('Customer')}>Customer session</button>
      <button disabled={busy} className="button" onClick={() => changeSession('University')}>University staff session</button>
      <button disabled={busy} className="button" onClick={() => changeSession(null)}>Sign out</button>
    </div>
    {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
  </aside>;
}
