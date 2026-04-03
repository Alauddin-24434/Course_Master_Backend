// routes/assignment.routes.ts
import { Router } from "express";
import { assignmentController } from "../controllers/assignment.controller";

const router = Router();

// ==============================
// CREATE Assignment
// ==============================
router.post("/", assignmentController.createAssignment);



export const assignmentRouter = router;
