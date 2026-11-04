import { Link } from 'react-router-dom';

export default function NotFound() {
  return <section className="panel"><h1 className="mb-3 text-2xl font-semibold">Page not found</h1><p className="mb-4">The university dashboard is intentionally not implemented in this starter.</p><Link to="/" className="button">Back home</Link></section>;
}
