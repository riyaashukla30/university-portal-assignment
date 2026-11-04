import { useEffect, useState } from 'react';
import { fetchCartCases } from '../services/cartService';
import useDynamicFormSchema from '../hooks/useDynamicFormSchema';
import Loading from '../components/Loading';
import CheckAccordion from '../components/CheckAccordion';

export default function MyCart() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { schema, loading: schemaLoading } = useDynamicFormSchema(1);
  useEffect(() => {
    fetchCartCases().then(result => setCases(result.cases)).finally(() => setLoading(false));
  }, []);
  return <section className="panel">
    <h1 className="mb-4 text-2xl font-semibold">My cart</h1>
    {loading ? <Loading /> : cases.length ? <CheckAccordion cases={cases} /> : <p>Your cart is empty.</p>}
    <div className="mt-6 border-t border-slate-200 pt-4">
      <h2 className="mb-2 font-semibold">Package form preview</h2>
      {schemaLoading ? <Loading /> : schema?.fields.map(field => <label key={field.name} className="block">{field.label}<input className="ml-3 rounded border p-2" type={field.type} required={field.required} /></label>)}
    </div>
  </section>;
}
