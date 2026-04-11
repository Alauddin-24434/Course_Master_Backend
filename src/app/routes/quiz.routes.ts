import { Router } from "express";
import { quizController } from "../controllers/quiz.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../interfaces/user.interface";

const router = Router();

// ==============================
// CREATE a new quiz
// ==============================
router.post("/", protect, authorize(UserRole.INSTRUCTOR), quizController.createQuiz);

// ==============================
// GET quizzes for only specific instructor to display in  dashbaord
// ==============================
router.get("/", protect, authorize(UserRole.INSTRUCTOR), quizController.getAllQuizzes);

// ==============================
// UPDATE & DELETE Quizzes
// ==============================
router.patch("/:id", protect, authorize(UserRole.INSTRUCTOR), quizController.updateQuiz);
router.delete("/:id", protect, authorize(UserRole.INSTRUCTOR), quizController.deleteQuiz);

export const quizRouter : Router= router;
