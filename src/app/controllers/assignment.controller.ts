// controllers/assignment.controller.ts
import { Request, Response } from "express";

import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { AssignmentService } from "../services/assignment.service";

// ==============================
// CREATE a new assignment
// ==============================
const createAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  const assignment = await AssignmentService.createAssignment(req.body);
  sendResponse(res, 201, "Assignment created successfully", assignment);
});

// ==============================
// GET all assignments
// ==============================
const getAssignmentsIntoIntrutorCourses = catchAsyncHandler(async (req: Request, res: Response) => {

  const id=req.user?.id;
  const assignments = await AssignmentService.getAssignmentsIntoIntrutorCourses(id as string);
  sendResponse(res, 200, "Assignments fetched successfully", assignments);
});

const updateAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  const assignment = await AssignmentService.updateAssignment(req.params.id as string, req.body);
  sendResponse(res, 200, "Assignment updated successfully", assignment);
});

const deleteAssignment = catchAsyncHandler(async (req: Request, res: Response) => {
  await AssignmentService.deleteAssignment(req.params.id as string);
  sendResponse(res, 200, "Assignment deleted successfully", null);
});

export const assignmentController = {
  createAssignment,
  getAssignmentsIntoIntrutorCourses,
  updateAssignment,
  deleteAssignment,
};

