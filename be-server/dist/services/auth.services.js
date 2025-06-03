import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { JWT_SECRET } from "../config.js";
export async function findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}
export async function findUserByUsername(username) {
    return prisma.user.findUnique({ where: { username } });
}
export async function createUser(email, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { email, username, password: hashedPassword },
    });
}
export function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
}
export async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
