import express from "express";
import { getDashboardAnalytics } from "../controllers/dashboard.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/analytics",protect, authorize("admin", "student"), getDashboardAnalytics);

export const dashboardRouter= router;
