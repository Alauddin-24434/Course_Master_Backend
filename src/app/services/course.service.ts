import { GetAllCoursesQuery, ICourse } from "../interfaces/course.interface";
import { CustomAppError } from "../errors/customError";
import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

/**
 * Create a new course entry in the database
 * 
 * This service handles creating the main course record and its 
 * initial batch information in a single atomic operation.
 * 
 * @param payload - Data containing course details and optional batch info
 * @returns The newly created course with relations
 */
const createCourse = async (payload: any) => {
  const { batch, ...courseData } = payload;

  return await prisma.course.create({
    data: {
      ...courseData,
      // Create associated batch if provided in payload
      batch: batch ? {
        create: {
          title: batch.title,
          startDate: new Date(batch.startDate),
          endDate: batch.endDate ? new Date(batch.endDate) : null,
        }
      } : undefined
    },
    include: {
      batch: true,
      category: true
    }
  });
};

/**
 * Retrieve a list of courses with filtering, search, and pagination
 * 
 * @param query - Contains search term, categoryID, page, limit, and sort options
 */
const getAllCourses = async (query: GetAllCoursesQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build the filter conditions for PostgreSQL
  const where: Prisma.CourseWhereInput = {
    AND: []
  };

  // Case-insensitive search on title or instructor
  if (query.search) {
    (where.AND as Prisma.CourseWhereInput[]).push({
      OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { instructor: { contains: query.search, mode: 'insensitive' } }
      ]
    });
  }

  // Exact match filter for category
  if (query.category) {
    (where.AND as Prisma.CourseWhereInput[]).push({ categoryId: query.category });
  }

  // Determine sort order (default: newest first)
  let orderBy: Prisma.CourseOrderByWithRelationInput = { createdAt: 'desc' };
  if (query.sort) {
    const [field, order] = query.sort.split(":");
    orderBy = { [field]: order === "desc" ? "desc" : "asc" };
  }

  // Execute count and data fetch in parallel for better performance
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        batch: true,
        _count: {
          select: { enrolledUsers: true }
        }
      }
    }),
    prisma.course.count({ where })
  ]);

  return {
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Fetch full details of a specific course including its modules and lessons
 */
const getCourseById = async (id: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      batch: true,
      modules: {
        include: {
          lessons: {
            include: {
              assignment: true,
              quiz: true
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!course) {
    throw new CustomAppError(404, "Course not found in our records");
  }

  return course;
};

/**
 * Update course information
 * 
 * @param id - Target course ID
 * @param payload - Partial data to update
 */
const updateCourse = async (id: string, payload: Partial<ICourse>) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new CustomAppError(404, "Unable to update: Course not found");
  }

  return await prisma.course.update({
    where: { id },
    data: payload as any,
    include: { batch: true, category: true }
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
 * Get courses enrolled by a specific student with calculated progress
 */
const getMyCourses = async (userId: string) => {
  // Fetch user enrollments along with course module/lesson data
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true
            }
          }
        }
      }
    }
  });

  // Calculate completion percentage for each enrolled course
  const myCourses = await Promise.all(enrollments.map(async (enrollment) => {
    const course = enrollment.course;
    
    // Flatten all lessons across modules to get total count
    const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
    const totalLessons = allLessonIds.length;

    // Count how many of these specific lessons the user has completed
    const completedCount = await prisma.completedLesson.count({
      where: {
        userId,
        lessonId: { in: allLessonIds }
      }
    });

    const progressPercentage = totalLessons > 0 
      ? Math.round((completedCount / totalLessons) * 100) 
      : 0;

    return {
      id: course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      totalLessons,
      completedLessonsCount: completedCount,
      progressPercentage,
      lastActivity: enrollment.lastActivity
    };
  }));

  return myCourses;
};

/**
 * Mark a specific lesson as completed for the authenticated user
 */
const completeLesson = async (userId: string, courseId: string, lessonId: string) => {
  // 1. Verify that the user is actually enrolled in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });

  if (!enrollment) {
    throw new CustomAppError(403, "Access denied: You are not enrolled in this course");
  }

  // 2. Mark lesson as completed (upsert ensures no duplicate error if already marked)
  await prisma.completedLesson.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId },
    update: {} // No changes needed if already exists
  });

  // 3. Update the last activity timestamp for the enrollment
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { lastActivity: new Date() }
  });
};

/**
 * Enroll a user into a course
 */
const enrollCourse = async (userId: string, courseId: string) => {
  // Check if course exists
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new CustomAppError(404, "Enrollment failed: Course not found");
  }

  // Create enrollment record
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {} // Do nothing if already enrolled
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
  enrollCourse,
};
