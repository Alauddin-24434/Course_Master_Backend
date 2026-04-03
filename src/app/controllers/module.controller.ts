import { Request, Response } from "express";
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
  const module = await moduleService.updateModule(moduleId, req.body);
  sendResponse(res, 200, "Module updated successfully", module);
});

// Get all modules of a course (student view)
const getModuleByCourseId = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?.id;
  const modules = await moduleService.getModulesByCourseId(courseId, studentId);
  sendResponse(res, 200, "Modules fetched successfully", modules);
});

// Get all modules (admin/general view)
const getAllModules = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const modules = await moduleService.getAllModules(courseId);
  sendResponse(res, 200, "All modules fetched successfully", modules);
});

// ==============================
// LESSON CONTROLLERS
// ==============================

// Add a lesson to a module
const addLesson = catchAsyncHandler(async (req: Request, res: Response) => {
  const lesson = await moduleService.addLesson(req.body);
  sendResponse(res, 201, "Lesson added successfully", lesson);
});

// Get a single lesson by ID
const getLessonById = catchAsyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const lesson = await moduleService.getLessonById(lessonId);
  sendResponse(res, 200, "Lesson fetched successfully", lesson);
});

// Get all lessons of a module
const getAllLessons = catchAsyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const lessons = await moduleService.getAllLessons(moduleId);
  sendResponse(res, 200, "Lessons fetched successfully", lessons);
});

// ==============================
// EXPORT CONTROLLER
// ==============================
export const moduleController = {
  addModule,
  updateModule,
  getModuleByCourseId,
  getAllModules,
  addLesson,
  getLessonById,
  getAllLessons,
};
