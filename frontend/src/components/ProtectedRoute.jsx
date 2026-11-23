import { Navigate } from 'react-router-dom';
import { getToken } from '../services/tokenStorage';

// Wraps a page that needs login. "children" = the page placed inside it.
// IMPORTANT: this is only for user experience (don't show a page that would
// fail anyway). Anyone can fake a token in their browser. The REAL security is
// the backend: it checks the token on every request (e.g. GET /auth/me).
function ProtectedRoute({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
