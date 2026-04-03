
import dotenv from "dotenv";
import { connectPrisma } from "./app/config/prisma";
import app from ".";

const PORT = Number(process.env.PORT || 5000);

async function server() {
  try {
    // Initialize Prisma PostgreSQL connection
    await connectPrisma();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1); 
  }
}

server();
