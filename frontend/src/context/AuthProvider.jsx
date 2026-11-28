import { useCallback, useRef, useState } from 'react';
import { me } from '../services/authService';
import { clearToken, getToken } from '../services/tokenStorage';
import { AuthContext } from './useAuth';

// What we know before asking the backend anything.
const EMPTY = { token: null, user: null, error: '' };

function AuthProvider({ children }) {
  // The answer from /auth/me, plus the token it was asked with.
  const [session, setSession] = useState(EMPTY);
  // A ref is a box that survives re-draws, and changing it does not re-draw.
  // It remembers which token we already asked about, so we ask only once.
  const requestedToken = useRef(null);

  // useCallback keeps this the same function between draws, so an effect that
  // depends on it does not run again and again.
  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token || requestedToken.current === token) return;
    requestedToken.current = token;

    try {
      const data = await me();
      // Ignore a late answer if the user logged out or changed meanwhile.
      if (requestedToken.current !== token) return;
      setSession({ token, user: data.user, error: '' });
    } catch (err) {
      if (requestedToken.current !== token) return;
      if (err.status === 401) {
        // Token expired or invalid. Forgetting it makes RequireRole redirect.
        clearToken();
        requestedToken.current = null;
        // A NEW object: React skips the re-draw if given the same one again.
        setSession({ ...EMPTY });
        return;
      }
      setSession({ token, user: null, error: err.message });
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    requestedToken.current = null;
    setSession(EMPTY);
  }, []);

  const retry = useCallback(() => {
    requestedToken.current = null;
    setSession(EMPTY);
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ ...session, loadUser, retry, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
