import { useEffect, useState } from 'react';
import { fetchFormSchema } from '../services/formSchemaService';

export default function useDynamicFormSchema(packageId) {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!packageId) return;
    setLoading(true);
    fetchFormSchema(packageId).then(response => setSchema(response.data)).finally(() => setLoading(false));
  }, [packageId]);
  return { schema, loading };
}
