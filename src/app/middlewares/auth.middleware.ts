import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

/**
 * Middleware to protect routes and ensure the user is authenticated.
 * 
 * Verifies the presence and validity of the JWT Bearer token in the request header.
 * If valid, the user record is retrieved from PostgreSQL and attached to the Request object.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  // Extract token from the Authorization header (expected format: 'Bearer <token>')
  let token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ status: "fail", message: "Access denied: No authentication token provided" });
  }

  try {
    // 1. Verify the authenticity and expiration of the JWT
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // 2. Fetch the corresponding user from PostgreSQL using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ status: "fail", message: "Authentication failed: User no longer exists" });
    }

    // 3. Attach standard user object to request for downstream access in controllers
    // The password field is explicitly excluded by not fetching or removing it if necessary
    const { password, ...safeUser } = user;
    req.user = safeUser as any; 
    
    next();
  } catch (err) {
    // Handle specific JWT errors like expiration or tampering
    return res.status(401).json({ status: "fail", message: "Authentication failed: Invalid or expired token" });
  }
};

/**
 * Middleware for restrictive Role-Based Access Control (RBAC).
 * 
 * @param roles - A list of roles that are allowed to access the route (e.g. 'admin')
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure 'protect' middleware has already run and populated req.user
    if (!req.user) {
      return res.status(401).json({ status: "fail", message: "Access denied: User authentication required" });
    }

    // Identify if the authenticated user's role is granted access
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: "fail", 
        message: `Permission denied: Your role (${req.user.role}) is not authorized for this resource` 
      });
    }

    next();
  };
};
