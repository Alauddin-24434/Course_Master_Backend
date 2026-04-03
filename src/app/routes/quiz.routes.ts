
import { Router } from "express";
import { quizController } from "../controllers/quiz.controller";

const router = Router();

// ==============================
// CREATE a new quiz
// ==============================
router.post("/", quizController.createQuiz);

export const quizRouter = router;
