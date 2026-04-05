
import dotenv from "dotenv";
dotenv.config();
import app from ".";

const PORT = Number(process.env.PORT || 5000);

async function server() {
  try {


    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

server();
