import { Request, RequestHandler, Response } from "express";
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

// ==============================
// GET quizzes (ONLY instructor)
// ==============================
const getAllQuizzes = catchAsyncHandler(async (req: Request, res: Response) => {
  const instructorId = req.user?.id; // ✅ from protect middleware

  const quizzes = await quizService.getQuizzesByInstructor(
    instructorId as string
  );

  sendResponse(res, 200, "Quizzes fetched successfully", quizzes);
});

const updateQuiz = catchAsyncHandler(async (req: Request, res: Response) => {
  const quiz = await quizService.updateQuiz(req.params.id as string, req.body);
  sendResponse(res, 200, "Quiz updated successfully", quiz);
});

const deleteQuiz = catchAsyncHandler(async (req: Request, res: Response) => {
  await quizService.deleteQuiz(req.params.id as string );
  sendResponse(res, 200, "Quiz deleted successfully", null);
});

export const quizController: QuizController = {
  createQuiz,
  getAllQuizzes,
  updateQuiz,
  deleteQuiz,
};

type QuizController = {
  createQuiz: RequestHandler;
  getAllQuizzes: RequestHandler;
  updateQuiz: RequestHandler;
  deleteQuiz: RequestHandler;
}