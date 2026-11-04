import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { fetchUniversityApplications } from '../services/universityService';

function toMessage(error) {
  if (error.name === 'InvalidResponseError') return error.message;
  if (error.response) return `${error.response.data?.error || 'Request failed'} (HTTP ${error.response.status}).`;
  return 'Could not reach the server. Check your connection and try again.';
}

// query = { page, search, status, scenario }.
// `phase` is exactly one of: 'loading' | 'success' | 'error'.
export default function useUniversityApplications(query) {
  const { page, search, status, scenario } = query;
  const [state, setState] = useState({ phase: 'loading', data: null, error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Abort the previous request when inputs change; `active` is a second guard so a
    // late response from an old request can never overwrite newer results.
    const controller = new AbortController();
    let active = true;
    setState({ phase: 'loading', data: null, error: '' });
    fetchUniversityApplications({ page, search, status, scenario }, controller.signal)
      .then(data => { if (active) setState({ phase: 'success', data, error: '' }); })
      .catch(error => {
        if (!active || axios.isCancel(error)) return;
        setState({ phase: 'error', data: null, error: toMessage(error) });
      });
    return () => { active = false; controller.abort(); };
  }, [page, search, status, scenario, attempt]);

  const retry = useCallback(() => setAttempt(count => count + 1), []);
  return { ...state, retry };
}
