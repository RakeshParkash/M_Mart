import { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken } from './token';

const AuthContext = createContext();

let externalSetAuth;

export function setAuthFromOutside(value) {
  if (externalSetAuth) externalSetAuth(value);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  externalSetAuth = setIsAuthenticated;

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'accessToken') {
        setIsAuthenticated(!!getAuthToken());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
