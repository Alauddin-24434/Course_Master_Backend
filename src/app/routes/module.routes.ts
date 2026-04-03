// routes/module.routes.ts
import { Router } from "express";
import { moduleController } from "../controllers/module.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router({ mergeParams: true });

// ==============================
// MODULE ROUTES
// ==============================

// Add a new module
router.post("/", moduleController.addModule);

// Get all modules
router.get("/", moduleController.getAllModules);

// Update a module
router.patch("/:moduleId", protect, authorize("admin"), moduleController.updateModule);

// Get modules for a specific course (student only)
router.get(
  "/:courseId",
  protect,
  authorize("student"),
  moduleController.getModuleByCourseId
);

// ==============================
// LESSON ROUTES
// ==============================

// Add a new lesson to a module
router.post("/lessons", moduleController.addLesson);

// Get all lessons in a module
router.get("/:moduleId/lessons", moduleController.getAllLessons);

// Get a specific lesson by ID
router.get("/:moduleId/lessons/:lessonId", moduleController.getLessonById);

export const moduleRouter = router;
