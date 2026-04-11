import { Request, RequestHandler, Response } from "express";
import { moduleService } from "../services/module.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ==============================
// MODULE CONTROLLERS
// ==============================

// Add a new module to a course
const addModule = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId, title } = req.body;
  const module = await moduleService.addModule(courseId, { title });
  sendResponse(res, 201, "Module added successfully", module);
});

// Update an existing module
const updateModule = catchAsyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const module = await moduleService.updateModule(moduleId as string, req.body);
  sendResponse(res, 200, "Module updated successfully", module);
});

// Delete a module
const deleteModule = catchAsyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  await moduleService.deleteModule(moduleId as string);
  sendResponse(res, 200, "Module deleted successfully", null);
});

// Get all modules of a course (student view)
const getModuleByCourseId = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?.id;
  const modules = await moduleService.getModulesByCourseId(courseId as string, studentId as string);
  sendResponse(res, 200, "Modules fetched successfully", modules);
});

// Get all modules (admin/general view)
const getAllModules = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const modules = await moduleService.getAllModules(courseId as string);
  sendResponse(res, 200, "All modules fetched successfully", modules);
});

// ==============================
// EXPORT CONTROLLER
// ==============================
export const moduleController : ModuleController = {
  addModule,
  updateModule,
  deleteModule,
  getModuleByCourseId,
  getAllModules,
};

type ModuleController = {
  addModule: RequestHandler;
  updateModule: RequestHandler;
  deleteModule: RequestHandler;
  getModuleByCourseId: RequestHandler;
  getAllModules: RequestHandler;
}
