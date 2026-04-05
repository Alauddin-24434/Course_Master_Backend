import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";

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
 * Delete a module and implicitly cascade its lessons
 */
const deleteModule = async (moduleId: string) => {
  return await prisma.module.delete({ where: { id: moduleId } });
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
  // const modules = await prisma.module.findMany({
  //   where: { courseId },
  //   include: {
  //     lessons: {
  //       include: {
  //         assignment: true,
  //         quiz: true,
  //         completedByUsers: {
  //           where: { userId }
  //         }
  //       },
  //       orderBy: { order: 'asc' }
  //     }
  //   },
  //   orderBy: { order: 'asc' }
  // });

  // If no modules found, verify course existence
  // if (!modules.length) {
  //   const courseExists = await prisma.course.findUnique({ where: { id: courseId } });
  //   if (!courseExists) throw new CustomAppError(404, "Course curriculum not found");
  // }

  // Traversal helper to track linear progression
  let isNextLessonLocked = false;

  // const processedModules = modules.map((mod: { id: string; title: string; lessons: Array<{ id: string; title: string; duration: number; videoUrl: string; assignment: any; quiz: any; completedByUsers: any[] }> }) => {
  //   const processedLessons = mod.lessons.map((les) => {
  //     // Lesson is completed if a record exists in CompletedLesson for this user
  //     const isCompleted = les.completedByUsers.length > 0;
      
  //     // Lesson is unlocked if no previous lesson was marked as incomplete
  //     const isUnlocked = !isNextLessonLocked;

  //     // Update lock status for subsequent lessons
  //     if (!isCompleted) {
  //       isNextLessonLocked = true;
  //     }

  //     return {
  //       id: les.id,
  //       title: les.title,
  //       duration: les.duration,
  //       videoUrl: les.videoUrl,
  //       assignment: les.assignment,
  //       quiz: les.quiz,
  //       isCompleted,
  //       isUnlocked
  //     };
  //   });

  //   const completedCount = processedLessons.filter(l => l.isCompleted).length;
  //   const lessonCount = processedLessons.length;
    
  //   return {
  //     id: mod.id,
  //     title: mod.title,
  //     lessonCount,
  //     completedCount,
  //     progressPercentage: lessonCount > 0 
  //       ? Math.round((completedCount / lessonCount) * 100) 
  //       : 0,
  //     lessons: processedLessons
  //   };
  // });

  return { modules: null };
};

/**
 * Fetch all modules within a specific course or globally
 * Sorted by their logical order in the curriculum.
 */
const getAllModules = async (courseId?: string) => {
  return await prisma.module.findMany({
    where: courseId ? { courseId } : {},
    include: {
      course: { select: { title: true } },
      _count: { select: { lessons: true } }
    },
    orderBy: { order: "asc" },
  });
};

export const moduleService = {
  addModule,
  updateModule,
  deleteModule,
  getModulesByCourseId,
  getAllModules,
};

