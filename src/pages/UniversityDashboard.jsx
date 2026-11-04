import { useEffect, useState } from 'react';
import useUniversityApplications from '../hooks/useUniversityApplications';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
];
const SCENARIOS = ['normal', 'slow', 'empty', 'error', 'null', 'missing-total-pages'];

function formatDate(iso) {
  const date = new Date(iso);
  // Always UTC so every viewer sees the same calendar day as the API's UTC timestamp.
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { timeZone: 'UTC' });
}

export default function UniversityDashboard() {
  const [query, setQuery] = useState({ page: 1, search: '', status: '', scenario: 'normal' });
  const [searchText, setSearchText] = useState('');
  const { phase, data, error, retry } = useUniversityApplications(query);

  // Debounce typing; a changed search always goes back to page 1.
  useEffect(() => {
    const timer = setTimeout(() => {
      const search = searchText.trim();
      setQuery(current => (current.search === search ? current : { ...current, search, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Status/scenario changes also reset to page 1; page changes keep search/status/scenario.
  const setStatus = status => setQuery(current => ({ ...current, status, page: 1 }));
  const setScenario = scenario => setQuery(current => ({ ...current, scenario, page: 1 }));
  const setPage = page => setQuery(current => ({ ...current, page }));

  const rows = data?.applications ?? [];
  const firstRow = (query.page - 1) * (data?.pageSize ?? 20) + 1;

  return <section className="panel" aria-labelledby="dashboard-title">
    <h1 id="dashboard-title" className="mb-4 text-2xl font-semibold">Applications</h1>

    <form className="mb-5 flex flex-wrap items-end gap-4" role="search" onSubmit={event => event.preventDefault()}>
      <label className="flex flex-col gap-1 text-sm font-medium">Search candidate or application number
        <input type="search" className="rounded border border-slate-300 p-2 font-normal" value={searchText} onChange={event => setSearchText(event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">Status
        <select className="rounded border border-slate-300 p-2 font-normal" value={query.status} onChange={event => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">Demo scenario (testing only)
        <select className="rounded border border-amber-300 bg-amber-50 p-2 font-normal" value={query.scenario} onChange={event => setScenario(event.target.value)}>
          {SCENARIOS.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
    </form>

    {phase === 'loading' && <Loading />}

    {phase === 'error' && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="mb-1 font-semibold">Could not load applications.</p>
      <p className="mb-3">{error}</p>
      <button className="button" onClick={retry}>Retry</button>
    </div>}

    {phase === 'success' && <>
      <p className="mb-3 text-sm text-slate-600" aria-live="polite">
        {data.total === 0
          ? '0 applications'
          : rows.length
            ? `Showing ${firstRow}–${firstRow + rows.length - 1} of ${data.total} applications`
            : `No rows on this page (${data.total} applications in total)`}
      </p>
      {data.total === 0
        ? <p>No applications match your search or filter.</p>
        : <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">University applications, page {query.page} of {data.totalPages}</caption>
            <thead><tr className="border-b">
              <th scope="col" className="p-3">Application no.</th>
              <th scope="col" className="p-3">Candidate</th>
              <th scope="col" className="p-3">Package</th>
              <th scope="col" className="p-3">Status</th>
              <th scope="col" className="p-3">Submitted</th>
            </tr></thead>
            <tbody>{rows.map(item => <tr key={item.applicationNumber} className="border-b border-slate-100">
              <td className="p-3 whitespace-nowrap">{item.applicationNumber}</td>
              <td className="p-3">{item.candidateName}</td>
              <td className="p-3">{item.packageName}</td>
              <td className="p-3"><StatusBadge status={item.status} /></td>
              <td className="p-3 whitespace-nowrap">{formatDate(item.submittedOn)}</td>
            </tr>)}</tbody>
          </table>
        </div>}
      <Pagination page={query.page} totalPages={data.totalPages} onPageChange={setPage} />
    </>}
  </section>;
}
