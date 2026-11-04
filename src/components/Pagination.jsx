export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return <nav aria-label="Pagination" className="mt-5 flex items-center gap-4">
    <button className="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
    <span>Page {page} of {totalPages}</span>
    <button className="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
  </nav>;
}
