import { Request, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { authServices } from "../services/auth.service";
import { loginValidation, signupValidation } from "../validations/auth.validation";
import { IUser, IUserLogin } from "../interfaces/user.interface";

import { generateTokens } from "../utils/generateTokens";
import { setRefreshTokenCookie } from "../utils/cookie";
import { sendResponse } from "../utils/sendResponse";

/**
 * Handle new student or admin registration
 */
const signup = catchAsyncHandler(async (req: Request, res: Response) => {
  // Validate raw request body against Zod schema
  const validated = signupValidation.parse(req.body);
  
  // Persist user to PostgreSQL
  const user = await authServices.signup(validated as IUser);

  // Generate session tokens
  const { accessToken, refreshToken } = generateTokens(user as IUser);
  
  // Set the refresh token as a secure httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // Send success response with created user and access token
  sendResponse(res, 201, "User registered successfully", { user, accessToken });
});

/**
 * Handle student/admin login and session creation
 */
const login = catchAsyncHandler(async (req: Request, res: Response) => {
  // Validate incoming credentials
  const validated = loginValidation.parse(req.body);
  
  // Verify credentials against database records
  const user = await authServices.login(validated as IUserLogin);

  // Issue identification tokens
  const { accessToken, refreshToken } = generateTokens(user as IUser);
  
  // Store session persistencer via secure cookie
  setRefreshTokenCookie(res, refreshToken);

  // Respond with authenticated user data
  sendResponse(res, 200, "User logged in successfully", { user, accessToken });
});

// ==============================
// REFRESH TOKEN CONTROLLER
// ==============================
const refreshToken = catchAsyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const { accessToken } = await authServices.refreshToken(token);

  sendResponse(res, 200, "Access token refreshed", { accessToken });
});

// ==============================
// LOGOUT CONTROLLER
// ==============================
const logout = catchAsyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendResponse(res, 200, "Logged out successfully");
});

export const authControllers = {
  signup,
  login,
  refreshToken,
  logout,
};
