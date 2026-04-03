// controllers/assignment.controller.ts
import { Request, Response } from "express";
import { assignmentService } from "../services/assignment.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ==============================
// CREATE a new assignment
// ==============================
const createAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  const assignment = await assignmentService.createAssignment(req.body);
  sendResponse(res, 201, "Assignment created successfully", assignment);
});


export const assignmentController = {
  createAssignment,
};
