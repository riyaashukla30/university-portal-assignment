export default function StatusBadge({ status }) {
  const color = status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{status?.replaceAll('_', ' ') || 'Unknown'}</span>;
}
