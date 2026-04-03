
import { Request, Response } from "express";
import { courseService } from "../services/course.service";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";

// ==============================
// CREATE a course
// ==============================
const createCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.createCourse(req.body);
  sendResponse(res, 201, "Course created successfully", course);
});

// ==============================
// GET all courses with advanced features
// ==============================
const getAllCourses = catchAsyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, category, sort } = req.query;

  const courses = await courseService.getAllCourses({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: search?.toString(),
    category: category?.toString(),
    sort: sort?.toString(),
  });

  sendResponse(res, 200, "Courses fetched successfully", courses);
});


// ==============================
// GET course by ID
// ==============================
const getCourseById = catchAsyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getCourseById(req.params.id);
  sendResponse(res, 200, "Course fetched successfully", course);
});


/**
 * Retrieve courses enrolled by the currently authenticated student
 */
const getMyCourses = catchAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id; // Standardized to 'id' from Prisma
  const courses = await courseService.getMyCourses(userId);
  sendResponse(res, 200, "Your enrolled courses retrieved successfully", courses);
});

/**
 * Mark a specific course lesson as completed for the current student
 */
const completeLesson = catchAsyncHandler(async (req: Request, res: Response) => {
  const { courseId, lessonId } = req.body;
  const userId = req.user!.id;

  await courseService.completeLesson(userId, courseId, lessonId);
  sendResponse(res, 200, "Progress tracked: Lesson marked as completed");
});

/**
 * Enroll the current user into a specific course
 */
const enrollCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  const userId = req.user!.id;

  await courseService.enrollCourse(userId, courseId);
  sendResponse(res, 200, "Enrollment successful: Welcome to the course");
});

// ==============================
// UPDATE a course
// ==============================
const updateCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  sendResponse(res, 200, "Course updated successfully", course);
});

// ==============================
// DELETE a course
// ==============================
const deleteCourse = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.deleteCourse(req.params.id);
  sendResponse(res, 200, result.message);
});

export const courseController = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyCourses,
  completeLesson,
};
