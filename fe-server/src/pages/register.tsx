import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState } from "react";
import Navbar from "../components/Navbar";


const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;



export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isloading, setLoading] = useState(false);

  const captchaRef = useRef<ReCAPTCHA | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      setError(null); 

      if (!captchaToken) {
        setError("Please complete the CAPTCHA.");
        return;
      }

      const response = await axios.post(`${backendUrl}/register`, {
        ...data,
        recaptchaToken: captchaToken,
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Registration failed");
      }

      login(response.data.token);
      navigate("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.error || "Registration failed. Please try again."
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
      <Navbar type="login" />
      <div style={styles.container}>
        <h2 style={styles.heading}>Register</h2>
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
              {...register("username")}
              placeholder="Username"
              style={styles.input}
            />
            {errors.username && (
              <span style={styles.error}>{errors.username.message}</span>
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
              onExpired={() => setCaptchaToken(null)} // Clear token on expiration
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          {isloading ? (
            <button type="button" disabled style={styles.button}>
              Registering...
            </button>
          ) : (
            <button type="submit" style={styles.button}>
              Register
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
