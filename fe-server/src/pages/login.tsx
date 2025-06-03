// src/pages/Login.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useRef } from "react";
import Navbar from "../components/Navbar";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const captchaRef = useRef<ReCAPTCHA | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError(null);

      if (!captchaToken) {
        setError("Please complete the CAPTCHA.");
        return;
      }

      const response = await axios.post(`${backendUrl}/login`, {
        ...data,
        recaptchaToken: captchaToken,
      });


      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Login failed");
      }

      login(response.data.token);
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.error || "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
      setCaptchaToken(null);
      if (captchaRef.current) {
        captchaRef.current.reset(); // Visually reset CAPTCHA box
      }
    }
  };

  return (
    <>
      <Navbar type="register" />
      <div style={styles.container}>
        <h2 style={styles.heading}>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              {...register("email")}
              placeholder="Email"
              style={styles.input}
            />
            {errors.email && (
              <span style={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              {...register("password")}
              placeholder="Password"
              style={styles.input}
            />
            {errors.password && (
              <span style={styles.error}>{errors.password.message}</span>
            )}
          </div>

          <div
            style={{
              margin: "1rem 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ReCAPTCHA
              ref={captchaRef}
              sitekey={SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          {loading ? (
            <button type="button" disabled style={styles.button}>
              Logging in...
            </button>
          ) : (
            <button type="submit" style={styles.button}>
              Login
            </button>
          )}
        </form>
      </div>
    </>
  );
}



const styles = {
  container: {
    maxWidth: 400,
    margin: "3rem auto",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    background: "#fff",
  },
  heading: {
    textAlign: "center" as const,
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  error: {
    color: "red",
    fontSize: "0.85rem",
    marginTop: "0.25rem",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "0.75rem",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    cursor: "pointer",
  },
};