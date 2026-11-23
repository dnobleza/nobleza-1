import { Navigate } from 'react-router-dom';
import { getToken } from '../services/tokenStorage';

// The opposite of ProtectedRoute: for /login and /register.
// If the user already has a token, skip these pages and go to the dashboard.
function GuestRoute({ children }) {
  if (getToken()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default GuestRoute;
