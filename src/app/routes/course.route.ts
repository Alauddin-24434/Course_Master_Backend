// routes/course.routes.ts
import { Router } from "express";
import { courseController } from "../controllers/course.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

// ==============================
// CREATE a course (Admin only)
// ==============================
router.post("/", protect, authorize("admin"), courseController.createCourse);

// ==============================
// GET all courses
// ==============================
router.get("/", courseController.getAllCourses);

// ==============================
// STATIC ROUTES (must come before dynamic routes)
// ==============================

// Get courses enrolled by the logged-in student
router.get("/my-courses", protect, authorize("student"), courseController.getMyCourses);

// Enroll in a course
router.post("/enroll/:courseId", protect, courseController.enrollCourse);

// Mark a lesson as completed
router.post("/complete-lesson", protect, courseController.completeLesson);

// ==============================
// DYNAMIC ROUTES (with :id param) - must come last
// ==============================

// Get course by ID
router.get("/:id", courseController.getCourseById);

// Update a course by ID (Admin only)
router.put("/:id", protect, authorize("admin"), courseController.updateCourse);

// Delete a course by ID (Admin only)
router.delete("/:id", protect, authorize("admin"), courseController.deleteCourse);

export const courseRouter = router;