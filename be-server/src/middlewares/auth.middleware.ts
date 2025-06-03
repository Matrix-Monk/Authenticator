import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import prisma from "../prisma/client.js";
import { JWT_SECRET } from "../config.js";



const authMiddleware = async (req : Request, res: Response, next: NextFunction) => {
 
  try {
    const token = req.headers.authorization?.split(" ")[1];

    

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET || "default");


    const userId = typeof decoded === "object" && "userId" in decoded ? decoded.userId : null;

    if (!userId) {
      res.status(401).json({ error: "Invalid token" });
      return
    }

    const userFound = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userFound) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const { password, ...user } = userFound ?? {}; 

    (req as any ).user = user; 
   
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return
  }
}

export default authMiddleware;
