import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";
import { verifyRecaptcha } from "../utils/recaptcha.js";
import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  generateToken,
  verifyPassword,
} from "../services/auth.services.js";




export async function registerUser(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);

    const isCaptchaValid = await verifyRecaptcha(data.recaptchaToken);
      if (!isCaptchaValid) {
          res.status(403).json({ error: "Captcha verification failed" });
          return
    }
      
    const existingUser = await findUserByEmail(data.email);

    if (existingUser) {
        res.status(400).json({ error: "Email already exists" });
        return; 
    }


    const existingUsername = await findUserByUsername(data.username);

    if (existingUsername) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }

    const user = await createUser(data.email, data.username, data.password);
    const token = generateToken(user.id);

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    else res.status(400).json({ error: "Unknown error" });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);

    const isCaptchaValid = await verifyRecaptcha(data.recaptchaToken);
      if (!isCaptchaValid) {
          res.status(403).json({ error: "Captcha verification failed" });
            return;
    }
        
    

    const user = await findUserByEmail(data.email);
      if (!user) {
        res.status(400).json({ error: "Invalid email or not registered" });
        return; 
    }
        

    const isValidPassword = await verifyPassword(data.password, user.password);
      if (!isValidPassword) {
          res.status(400).json({ error: "Invalid password" });
          return;
    }
      

    const token = generateToken(user.id);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    else res.status(400).json({ error: "Unknown error" });
  }
}



export function verifyToken(req: Request, res: Response) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ valid: false, message: "No token provided" });
      return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
}
