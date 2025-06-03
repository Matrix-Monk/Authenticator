import dotenv from "dotenv";


dotenv.config();

export const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
export const PORT = process.env.PORT || 3001;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
export const JWT_SECRET = process.env.JWT_SECRET || "default";
