// src/components/ProtectedRoute.tsx
import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const {loading, token } = useAuth();
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {

    if (loading) {
      setValid(null);
      return;
    }
    if (!token) {
      setValid(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setValid(res.status === 200);
      } catch {
        setValid(false);
      }
    };

    if (token) verify();
    else setValid(false);
  }, [token, loading]);

  if (valid === null) return <p>Checking auth...</p>;
  if (!valid) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
