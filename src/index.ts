import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // <-- ADD THIS
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { baseRouter } from "./app/routes/baseRouter";
import { webhookRouter } from "./app/routes/webhook.route";
import rateLimit from "express-rate-limit";

// ==============================
// INITIALIZE EXPRESS APP
// ==============================
const app : Application= express();

// ==============================
// MIDDLEWARES
// ==============================

// Webhooks (must be before express.json)
app.use("/api/webhook", webhookRouter);

// Parse JSON bodies
app.use(express.json());

// Enable CORS for frontend URLs
app.use(
  cors({
    origin: [
      `${process.env.FRONTEND_URL}`,
    ], 
    credentials: true, // cookie allow
  })
);

// Parse cookies
app.use(cookieParser());

// ==============================
// RATE LIMITER
// ==============================
// Limit each IP to 100 requests per 15 minutes

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit per IP
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  }
});
// Apply the rate limiting middleware to all requests.
app.use(limiter)


// ==============================
// ROOT ROUTE
// ==============================
app.get("/", (req: Request, res: Response) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

  const date = new Date().toLocaleString();

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CourseMaster | Server Status</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #6366f1;
        --secondary: #a855f7;
        --bg: #0f172a;
        --card: #1e293b;
        --text: #f8fafc;
        --text-muted: #94a3b8;
        --success: #22c55e;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: var(--bg);
        color: var(--text);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        overflow: hidden;
      }

      .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 10% 10%, rgba(168, 85, 247, 0.1) 0%, transparent 40%);
      }

      .container {
        width: 100%;
        max-width: 500px;
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 40px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.8s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 32px;
        text-align: center;
      }

      .logo-icon {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 16px;
        box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.4);
      }

      .logo-icon svg {
        width: 32px;
        height: 32px;
        color: white;
      }

      h1 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        background: linear-gradient(to right, #fff, #94a3b8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(34, 197, 94, 0.1);
        color: var(--success);
        padding: 6px 12px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 600;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        background-color: var(--success);
        border-radius: 50%;
        box-shadow: 0 0 12px var(--success);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
      }

      .stats {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 32px;
      }

      .stat-card {
        background: rgba(15, 23, 42, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stat-label {
        color: var(--text-muted);
        font-size: 14px;
        font-weight: 500;
      }

      .stat-value {
        font-weight: 600;
        color: var(--text);
      }

      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border-radius: 12px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-primary {
        background: var(--primary);
        color: white;
      }

      .btn-primary:hover {
        background: #4f46e5;
        transform: translateY(-2px);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }

      .footer {
        margin-top: 32px;
        text-align: center;
        font-size: 12px;
        color: var(--text-muted);
      }
    </style>
  </head>
  <body>
    <div class="backdrop"></div>
    <div class="container">
      <div class="header">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1>CourseMaster</h1>
        <div class="status-pill">
          <span class="status-dot"></span>
          Operational
        </div>
      </div>

      <div class="stats">
        <div class="stat-card">
          <span class="stat-label">Server Uptime</span>
          <span class="stat-value">${uptimeString}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Server Time</span>
          <span class="stat-value">${date}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Environment</span>
          <span class="stat-value">Production</span>
        </div>
      </div>

      <div class="actions">
        <a href="/" class="btn btn-primary">
          <svg style="width:18px;height:18px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Explore API
        </a>
        <a href="https://course-master-frontend-nine.vercel.app" class="btn btn-secondary" target="_blank">
          <svg style="width:18px;height:18px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Frontend
        </a>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} CourseMaster Engine. All systems normal.
      </div>
    </div>
  </body>
  </html>
  `

  res.send(html)
});

// ==============================
// API ROUTES
// ==============================
app.use("/api", baseRouter);


// ==============================
// 404 NOT FOUND ROUTE
// ==============================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ==============================
// GLOBAL ERROR HANDLER
// ==============================
app.use(globalErrorHandler);

// ==============================
// EXPORT APP
// ==============================
export default app;
