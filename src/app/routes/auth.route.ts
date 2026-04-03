import { Router } from "express";
import { authControllers } from "../controllers/auth.controller";

const router = Router();

// ==============================
// POST /auth/signup
// ==============================
// Register a new user
router.post("/signup", authControllers.signup);

// ==============================
// POST /auth/login
// ==============================
// User login
router.post("/login", authControllers.login);

// ==============================
// GET /auth/refresh-token
// ==============================
// Refresh the access token using the refresh token
router.get("/refresh-token", authControllers.refreshToken);

export const authRouter = router;
