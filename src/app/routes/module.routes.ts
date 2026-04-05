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

// Delete a module
router.delete("/:moduleId", protect, authorize("admin"), moduleController.deleteModule);

// Get modules for a specific course (student only)
router.get(
  "/:courseId",
  protect,
  authorize("student"),
  moduleController.getModuleByCourseId
);



export const moduleRouter = router;
