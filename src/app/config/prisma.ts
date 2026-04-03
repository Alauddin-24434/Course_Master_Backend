import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Prisma Service Initialization
 * 
 * In Prisma 7, we must provide a database adapter (pg in this case) 
 * for connecting to PostgreSQL.
 */

// Connection string from environment
const connectionString = `${process.env.DATABASE_URL}`;

// Initialize standard pg Pool
const pool = new pg.Pool({ connectionString });

// Wrap it with Prisma adapter
const adapter = new PrismaPg(pool);

// Export the singleton Prisma instance for use across the application
export const prisma = new PrismaClient({ adapter });

// Helper to check connection
export const connectPrisma = async () => {
  try {
    await prisma.$connect();
    console.log("🐘 Prisma PostgreSQL connected successfully");
  } catch (error) {
    console.error("❌ Prisma connection failed:", error);
    process.exit(1);
  }
};
