import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma/client";
const app = express();
const prisma = new PrismaClient();
dotenv.config();
const PORT = process.env.PORT || 3001;
app.use(express.json());
const registerData = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    username: z.string().min(3),
    password: z.string().min(6),
});
const loginData = z.object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
});
app.post("/register", async (req, res) => {
    try {
        const parsedData = registerData.parse(req.body);
        if (!parsedData.email || !parsedData.username || !parsedData.password) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                email: parsedData.email,
            },
        });
        if (existingUser) {
            res.status(400).json({ error: "User with this email already exists" });
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
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "default", {
            expiresIn: 15 * 60, // 15 minutes
        });
        res.status(201).json({
            message: "User registered successfully",
            token,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: "An unknown error occurred" });
        }
    }
});
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
