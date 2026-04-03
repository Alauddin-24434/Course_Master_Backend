
import { Request, Response } from "express";
import { quizService } from "../services/quiz.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ==============================
// CREATE a new quiz
// ==============================
const createQuiz = catchAsyncHandler(async (req: Request, res: Response) => {
  const quiz = await quizService.createQuiz(req.body);
  sendResponse(res, 201, "Quiz created successfully", quiz);
});

export const quizController = {
  createQuiz,
};
