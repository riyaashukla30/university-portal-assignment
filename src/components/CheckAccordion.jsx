import { useState } from 'react';

export default function CheckAccordion({ cases }) {
  const [expanded, setExpanded] = useState({});
  return <div className="space-y-3">{cases.map(item => <section className="rounded-lg border border-slate-200" key={item.individual_service_id}>
    <button aria-expanded={Boolean(expanded[item.individual_service_id])} className="flex w-full justify-between p-4 text-left"
      onClick={() => setExpanded(current => ({ ...current, [item.individual_service_id]: !current[item.individual_service_id] }))}>
      <span>{item.candidate_name}</span>
      <span className="text-sm text-slate-500">{new Date(item.created_on).toLocaleDateString('en-GB')}</span>
    </button>
    {expanded[item.individual_service_id] && <ul className="border-t border-slate-100 p-4">{item.checks.map(check => <li key={check.id} className="flex justify-between py-2"><span>{check.name}</span><span>{check.status}</span></li>)}</ul>}
  </section>)}</div>;
}
