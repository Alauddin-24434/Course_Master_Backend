import { prisma } from "../config/prisma";
import { CustomAppError } from "../errors/customError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, IUserLogin } from "../interfaces/user.interface";
import { Role } from "@prisma/client";

/**
 * Handle user registration (Sign-Up)
 * 
 * @param payload - User data including name, email, password, etc.
 * @returns The created user object without the password
 */
const signup = async (payload: IUser) => {
  // Check if a user with the same email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new CustomAppError(400, "User with this email already exists");
  }

  // Hash the password before saving for security
  const hashedPassword = await bcrypt.hash(payload.password!, 12);

  // Create new user in PostgreSQL using Prisma
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: (payload.role as Role) || Role.student,
      bio: payload.bio || null,
      avatar: payload.avatar || null,
    },
  });

  // Remove password from response object for security
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Authenticate user (Login)
 * 
 * @param payload - User login credentials (email, password)
 * @returns The user object without password if authentication is successful
 */
const login = async (payload: IUserLogin) => {
  // Find user by email in PostgreSQL
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new CustomAppError(404, "User not found with this email");
  }

  // Compare provided password with the hashed password in the database
  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw new CustomAppError(401, "Invalid credentials, password doesn't match");
  }

  // Remove password before returning user data
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Generate a new access token using a valid refresh token
 * 
 * @param token - The refresh token provided by the client
 * @returns A fresh access token
 */
const refreshToken = async (token: string) => {
  if (!token) {
    throw new CustomAppError(401, "No refresh token provided");
  }

  try {
    // Verify the provided refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
    };

    // Generate a new access token with 1 hour expiration
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    // Handle JWT verification errors (expired or tampered)
    throw new CustomAppError(401, "Invalid or expired refresh token");
  }
};

export const authServices = {
  signup,
  login,
  refreshToken,
};
