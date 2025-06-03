import express, { Request, Response } from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "../generated/prisma/client.js";
import authMiddleware from "./middleware.js";

const app = express();
const prisma = new PrismaClient();
dotenv.config();

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  username: z.string().min(3),
  password: z.string().min(6, "Password must be at least 6 characters"),
  recaptchaToken: z.string().min(1, "Recaptcha token is required"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  recaptchaToken: z.string().min(1, "Recaptcha token is required"),
});

app.post("/register", async (req: Request, res: Response) => {
  try {

    const parsedData = registerSchema.parse(req.body);


    if (!parsedData.email || !parsedData.username || !parsedData.password || !parsedData.recaptchaToken) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const verifyResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET,
          response: parsedData.recaptchaToken,
        },
      }
    );


    const { success } = verifyResponse.data;

    if (!success) {
      res.status(403).json({ error: "Captcha verification failed, Try again" });
      return; 
    }


    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedData.email,
      },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email already exists, Please login" });
      return;
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: parsedData.username },
    });

    if (existingUsername) {
      res.status(400).json({ error: "Username already taken. Please choose another." });
        return; 
    }

    const hashedPassword = await bcrypt.hash(parsedData.password, 10);


    const user = await prisma.user.create({
      data: {
        email: parsedData.email,
        username: parsedData.username,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default",
      {
        expiresIn: '15m', // 15 minutes
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
});


app.post("/login", async (req: Request, res: Response) => {
  try {
    
    const parsedData = loginSchema.parse(req.body);

    if (!parsedData.email || !parsedData.password || !parsedData.recaptchaToken) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const verifyResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET,
          response: parsedData.recaptchaToken,
        },
      }
    );


    const { success, score, action } = verifyResponse.data;

    if (!success) {
      res.status(403).json({ error: "Captcha verification failed, Try again" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parsedData.email,
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid Email or Email not registered" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(parsedData.password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default",
      {
        expiresIn: 15 * 60, // 15 minutes
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
})


app.get("/auth/verify", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ valid: false, message: "No token provided" });
    return; 
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default");
    res.status(200).json({ valid: true, user: decoded });
    return;
  } catch (error) {
     res
      .status(401)
       .json({ valid: false, message: "Invalid or expired token" });
       return;
  }
});

app.use(authMiddleware)

app.get("/", (req, res) => {


  res.status(200).json({ message: "Welcome", user: (req as any).user });

});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
