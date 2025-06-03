import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma/client.js";
const prisma = new PrismaClient();
dotenv.config();
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default");
        const userId = typeof decoded === "object" && "userId" in decoded ? decoded.userId : null;
        if (!userId) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        const userFound = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!userFound) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        const { password, ...user } = userFound ?? {};
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Invalid token" });
        return;
    }
};
export default authMiddleware;
