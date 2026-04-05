import {  ICourse } from "../interfaces/course.interface";
import { CustomAppError } from "../errors/customError";
import { prisma } from "../../lib/prisma";

/**
 * Create a new course entry in the database
 */
const createCourse = async (payload: ICourse) => {
  try {
    const {
      title,
      description,
      categoryId,
      instructorId,
      previewVideo,
      price,
      thumbnail,
    } = payload;

    const result = await prisma.course.create({
      data: {
        title,
        description,
        categoryId,
        instructorId,
        previewVideo,
        price,
        thumbnail,
      } as any,
    });

    return result;
  } catch (error: any) {
    console.error("❌ Error creating course:", error.message);
    throw new Error("Course creation failed");
  }
};

/**
 * Retrieve a list of courses with filtering, search, and pagination
 */
const getAllCourses = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { instructor: { name: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  if (query.category) {
    where.categoryId = query.category;
  }

  let orderBy: any = { createdAt: "desc" };

  if (query.sort) {
    const [field, order] = query.sort.split(":");
    orderBy = { [field as string]: order === "desc" ? "desc" : "asc" };
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        instructor: {
          select: { name: true, avatar: true }
        },
        _count: {
          select: { enrolledUsers: true },
        },
      } as any,
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Fetch full details of a specific course including its modules and lessons.
 */
const getCourseById = async (id: string, userId?: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      instructor: {
        select: { name: true, avatar: true, bio: true }
      },
      modules: {
        include: {
          // ✅ assignment and quiz are now on the module level
          assignment: true,
          quiz: { include: { questions: true } },
          lessons: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      },
      _count: {
        select: { enrolledUsers: true }
      }
    }
  });

  if (!course) {
    throw new CustomAppError(404, "Course not found in our records");
  }

  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } }
    });
    isEnrolled = !!enrollment;
  }

  return { ...course, isEnrolled };
};

/**
 * Update course information
 */
const updateCourse = async (id: string, payload: Partial<ICourse>) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new CustomAppError(404, "Unable to update: Course not found");
  }

  return await prisma.course.update({
    where: { id },
    data: payload as any,
    include: { category: true } as any
  });
};

/**
 * Remove a course and all its related content (cascades)
 */
const deleteCourse = async (id: string) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new CustomAppError(404, "Unable to delete: Course not found");
  }

  await prisma.course.delete({ where: { id } });
  return { message: "Course has been successfully deleted from the server" };
};

/**
 * Mark a specific lesson as completed for the authenticated user
 */
const completeLesson = async (userId: string, courseId: string, lessonId: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });

  if (!enrollment) {
    throw new CustomAppError(403, "Access denied: You are not enrolled in this course");
  }

  await prisma.completedLesson.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId },
    update: {}
  });

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { lastActivity: new Date() }
  });
};

/**
 * Get all courses the current user is enrolled in with progress stats
 */
const getMyCourses = async (userId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                select: { id: true }
              }
            }
          }
        }
      }
    } as any,
    orderBy: { lastActivity: 'desc' }
  });

  const completedLessons = await prisma.completedLesson.findMany({
    where: { userId },
    select: { lessonId: true }
  });
  const completedLessonIds = new Set(completedLessons.map(cl => cl.lessonId));

  return enrollments.map((enrollment: any) => {
    const course = enrollment.course;
    const allLessons = course.modules.flatMap((m: any) => m.lessons);
    const totalLessons = allLessons.length;
    const completedLessonsCount = allLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessonsCount / totalLessons) * 100) 
      : 0;

    return {
      id: course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      totalLessons,
      completedLessonsCount,
      progressPercentage,
      lastActivity: enrollment.lastActivity
    };
  });
};

export const courseService = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
  completeLesson,
};
