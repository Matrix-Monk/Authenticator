import { Router } from "express";
import { loginUser, registerUser, verifyToken, } from "../controllers/auth.controller.js";
const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/auth/verify", verifyToken);
export default router;
