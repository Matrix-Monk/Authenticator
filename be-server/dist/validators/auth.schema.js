import { z } from "zod";
export const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    username: z.string().min(3),
    password: z.string().min(6, "Password must be at least 6 characters"),
    recaptchaToken: z.string().min(1, "Recaptcha token is required"),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    recaptchaToken: z.string().min(1, "Recaptcha token is required"),
});
