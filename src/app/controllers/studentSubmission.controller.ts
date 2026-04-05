import { Request, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { AssignmentService } from "../services/assignment.service";
import { quizService } from "../services/quiz.service";

// ==============================
// SUBMIT ASSIGNMENT (Student)
// ==============================
const submitAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { assignmentId, content } = req.body;

  const submission = await AssignmentService.submitAssignment(assignmentId, userId, content);
  sendResponse(res, 201, "Assignment submitted successfully", submission);
});

// ==============================
// SUBMIT QUIZ (Student)
// ==============================
const submitQuiz = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { quizId, answers } = req.body;

  const result = await quizService.submitQuiz(quizId, userId, answers);
  sendResponse(res, 201, "Quiz submitted successfully", result);
});

export const studentSubmissionController = {
  submitAssignment,
  submitQuiz,
};
