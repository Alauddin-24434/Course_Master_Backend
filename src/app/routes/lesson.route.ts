import { Router } from "express";
import { lessonController } from "../controllers/lesson.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ==============================
// LESSON ROUTES
// ==============================

// Add a new lesson to a module (INSTRUCTOR only)
router.post("/", protect, authorize(UserRole.INSTRUCTOR), lessonController.addLesson);

// Update a lesson (INSTRUCTOR only)
router.patch("/:lessonId", protect, authorize(UserRole.INSTRUCTOR), lessonController.updateLesson);

// Delete a lesson (INSTRUCTOR only)
router.delete("/:lessonId", protect, authorize(UserRole.INSTRUCTOR), lessonController.deleteLesson);

// Get all lessons (Instructor Only)
router.get("/", protect, lessonController.getAllLessons);

// Get a specific lesson by ID
router.get("/:lessonId", protect, lessonController.getLessonById);

export const lessonRouter = router;
