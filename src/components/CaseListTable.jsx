import StatusBadge from './StatusBadge';

export default function CaseListTable({ cases }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm">
    <caption className="sr-only">Customer cases</caption>
    <thead><tr className="border-b"><th className="p-3">Case</th><th className="p-3">Candidate</th><th className="p-3">Status</th><th className="p-3">Created</th></tr></thead>
    <tbody>{cases.map(item => <tr key={item.individual_service_id} className="border-b border-slate-100">
      <td className="p-3">{item.individual_service_id}</td><td className="p-3">{item.candidate_name}</td>
      <td className="p-3"><StatusBadge status={item.case_status} /></td>
      <td className="p-3">{new Date(item.created_on).toLocaleDateString('en-GB')}</td>
    </tr>)}</tbody>
  </table></div>;
}
