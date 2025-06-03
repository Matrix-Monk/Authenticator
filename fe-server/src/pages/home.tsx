// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export default function Home() {
  const { loading, logout, token } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {

        const res = await axios.get(`${backendUrl}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status !== 200) {
          throw new Error("Failed to fetch user info");
        }

        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to load user info", err);
        logout();
        navigate("/login");
      }
    };

    fetchUser();
  }, [loading, token, logout, navigate]);
  
  return (
    <>
      <Navbar type="logout" />
      <div style={{ padding: "2rem" }}>
        <h1>Welcome</h1>
        {user ? (
          <>
            <p>Id: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Username: {user.username}</p>
            <p>Created_at: {new Date(user.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          </>
        ) : (
          <p>Loading user info...</p>
        )}
      </div>
    </>
  );
}
