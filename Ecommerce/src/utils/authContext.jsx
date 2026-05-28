import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken } from "./token";

const AuthContext = createContext();

let externalSetAuth;

export function setAuthFromOutside(value) {
  if (externalSetAuth) externalSetAuth(value);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  externalSetAuth = setIsAuthenticated;

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(!!getAuthToken());
    const onStorage = (event) => {
      if (event.key === "accessToken") syncAuth();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncAuth();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncAuth);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncAuth);
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
