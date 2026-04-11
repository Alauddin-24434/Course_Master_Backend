import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { protect, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", reviewController.getAllReviews);
router.post("/", protect, authorize("student", "instructor", "admin"), reviewController.createReview);
router.delete("/:id", protect, authorize("student", "instructor", "admin"), reviewController.deleteReview);

export const reviewRoutes : Router= router;
