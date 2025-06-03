// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const stored = localStorage.getItem("token");

    if (stored) setToken(stored);
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
 
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  
  const logout = () => {

    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ loading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
