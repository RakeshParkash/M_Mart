import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

let externalSetAuth;

export function setAuthFromOutside(value) {
  if (externalSetAuth) externalSetAuth(value);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  externalSetAuth = setIsAuthenticated;

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
