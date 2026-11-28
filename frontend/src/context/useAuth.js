import { createContext, useContext } from 'react';

// A "context" is a value that any component can read without it being passed
// down as a prop through every level. AuthProvider fills it.
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
