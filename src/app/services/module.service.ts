import { CustomAppError } from "../errors/customError";
import { prisma } from "../config/prisma";

/**
 * Add a new module to a specific course
 * 
 * Automatically determines the sequential order of the module within the course.
 * 
 * @param courseId - The unique identifier of the parent course
 * @param moduleData - Object containing module details like 'title'
 * @returns The newly created module record
 */
const addModule = async (courseId: string, moduleData: { title: string }) => {
  // Check if course exists before adding module
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new CustomAppError(404, "Course not found to attach module");

  // Calculate the next order index for sequential playback/display
  const lastModule = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' }
  });
  const nextOrder = lastModule ? lastModule.order + 1 : 0;

  return await prisma.module.create({
    data: {
      title: moduleData.title,
      courseId,
      order: nextOrder
    }
  });
};

/**
 * Update existing module information
 * 
 * @param moduleId - Target module ID
 * @param payload - Updated data fields
 * @returns The updated module record
 */
const updateModule = async (moduleId: string, payload: { title?: string }) => {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) throw new CustomAppError(404, "Module not found for update");

  return await prisma.module.update({
    where: { id: moduleId },
    data: payload
  });
};

/**
 * Retrieve the full course curriculum including lesson completion status 
 * and unlocking logic for a specific student.
 * 
 * Implements linear progression: a lesson is 'unlocked' only if all 
 * previous lessons in the course have been completed.
 * 
 * @param courseId - The ID of the course to retrieve
 * @param userId - The ID of the student viewing the curriculum
 * @returns Structured modules and lessons with progress metadata
 */
const getModulesByCourseId = async (courseId: string, userId: string) => {
  const modules = await prisma.module.findMany({
    where: { courseId },
    include: {
      lessons: {
        include: {
          assignment: true,
          quiz: true,
          completedByUsers: {
            where: { userId }
          }
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  // If no modules found, verify course existence
  if (!modules.length) {
    const courseExists = await prisma.course.findUnique({ where: { id: courseId } });
    if (!courseExists) throw new CustomAppError(404, "Course curriculum not found");
  }

  // Traversal helper to track linear progression
  let isNextLessonLocked = false;

  const processedModules = modules.map((mod) => {
    const processedLessons = mod.lessons.map((les) => {
      // Lesson is completed if a record exists in CompletedLesson for this user
      const isCompleted = les.completedByUsers.length > 0;
      
      // Lesson is unlocked if no previous lesson was marked as incomplete
      const isUnlocked = !isNextLessonLocked;

      // Update lock status for subsequent lessons
      if (!isCompleted) {
        isNextLessonLocked = true;
      }

      return {
        id: les.id,
        title: les.title,
        duration: les.duration,
        videoUrl: les.videoUrl,
        assignment: les.assignment,
        quiz: les.quiz,
        isCompleted,
        isUnlocked
      };
    });

    const completedCount = processedLessons.filter(l => l.isCompleted).length;
    const lessonCount = processedLessons.length;
    
    return {
      id: mod.id,
      title: mod.title,
      lessonCount,
      completedCount,
      progressPercentage: lessonCount > 0 
        ? Math.round((completedCount / lessonCount) * 100) 
        : 0,
      lessons: processedLessons
    };
  });

  return { modules: processedModules };
};

/**
 * Fetch all modules within a specific course
 * Sorted by their logical order in the curriculum.
 */
const getAllModules = async (courseId: string) => {
  return await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
};

/**
 * Fetch all lessons within a specific module
 * Sorted by their logical order in the curriculum.
 */
const getAllLessons = async (moduleId: string) => {
  return await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { order: "asc" },
  });
};

/**
 * Fetch a single lesson by ID
 */
const getLessonById = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      assignment: true,
      quiz: true,
    },
  });

  if (!lesson) throw new CustomAppError(404, "Lesson not found");
  return lesson;
};

/**
 * Attach a new instructional lesson to a module
 * 
 * @param payload - Lesson details and parent module ID
 * @returns The newly created lesson record
 */
const addLesson = async (payload: {
  moduleId: string;
  title: string;
  videoUrl: string;
  duration: number;
}) => {
  // Ensure the module exists
  const mod = await prisma.module.findUnique({ where: { id: payload.moduleId } });
  if (!mod) throw new CustomAppError(404, "Parent module not found for lesson attachment");

  // Calculate next sequential position
  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId: payload.moduleId },
    orderBy: { order: 'desc' }
  });
  const nextOrder = lastLesson ? lastLesson.order + 1 : 0;

  return await prisma.lesson.create({
    data: {
      title: payload.title,
      videoUrl: payload.videoUrl,
      duration: payload.duration,
      moduleId: payload.moduleId,
      order: nextOrder
    }
  });
};

export const moduleService = {
  addModule,
  updateModule,
  getModulesByCourseId,
  getAllModules,
  addLesson,
  getAllLessons,
  getLessonById,
};
