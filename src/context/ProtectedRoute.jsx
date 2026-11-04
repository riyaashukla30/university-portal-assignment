import { Navigate } from 'react-router-dom';
import { useAppContext } from './AppContext';
import Loading from '../components/Loading';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, authLoading, userType } = useAppContext();
  const isDev = import.meta.env.MODE === 'development';
  if (authLoading) return <Loading />;
  // Dev still lets signed-out users through on routes WITHOUT allowedRoles (unchanged legacy behaviour
  // for customer pages). Routes that declare allowedRoles are role-restricted, so they require a session in dev too.
  const requiresRole = Boolean(allowedRoles?.length);
  if (!isAuthenticated && (!isDev || requiresRole)) return <Navigate to="/" replace />;
  if (allowedRoles?.length && !allowedRoles.includes(userType)) {
    return <p role="alert" className="panel">You do not have access to this page.</p>;
  }
  return children;
}
