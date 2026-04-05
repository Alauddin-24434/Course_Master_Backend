import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";
import { stripe } from "../../lib/stripe";


/**====================================
 * Enroll a user into a course
 * ===================================
 */
const enrollCourse = async (userId: string, courseId: string) => {
  // Check if course exists
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new CustomAppError(404, "Enrollment failed: Course not found");
  }

  if (course.price > 0) {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (existingEnrollment) {
      throw new CustomAppError(400, "You are already enrolled in this course");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/student/my-courses?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses/${course.id}?canceled=true`,
      customer_email: user?.email,
      client_reference_id: userId,
      metadata: {
        courseId: course.id,
        userId: userId
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
            },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
    });

    await prisma.payment.create({
       data: {
          amount: course.price,
          currency: 'usd',
          status: 'pending',
          stripeSessionId: session.id,
          userId,
          courseId
       }
    });

    return { paymentUrl: session.url };
  } else {
    // Free course, enroll directly
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {} // Do nothing if already enrolled
    });
    return enrollment;
  }
};


/**====================================
 * Get Enrollments for a user
 * ===================================
 */
const getMyEnrollments = async (userId: string) => {
  return await prisma.enrollment.findMany({
    where: { userId },
    include: { course: true }
  });
};


/**====================================
 * Get detailed curriculum for an enrolled course
 * ===================================
 */
const getEnrolledCourseContent = async (userId: string, courseId: string) => {
  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      modules: {
        include: {
          assignment: true,
          quiz: {
            include: { questions: true }
          },
          lessons: {
            include: {
              completedByUsers: {
                where: { userId }
              }
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!course) {
    throw new CustomAppError(404, "Course not found");
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });

  if (!enrollment) {
    throw new CustomAppError(403, "Access denied: You are not enrolled in this course");
  }

  // Linear progression logic
  let isNextLessonLocked = false;
  const processedModules = course.modules.map(mod => {
    const processedLessons = mod.lessons.map(les => {
      const isCompleted = les.completedByUsers.length > 0;
      const isUnlocked = !isNextLessonLocked;
      
      // Lock subsequent lessons if this one is not completed
      if (!isCompleted) {
        isNextLessonLocked = true;
      }

      return {
        id: les.id,
        title: les.title,
        videoUrl: les.videoUrl,
        duration: les.duration,
        order: les.order,
        isCompleted,
        isUnlocked
      };
    });

    const lessonCount = processedLessons.length;
    const completedCount = processedLessons.filter(l => l.isCompleted).length;

    return {
      id: mod.id,
      title: mod.title,
      order: mod.order,
      lessonCount,
      completedCount,
      progressPercentage: lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0,
      assignment: mod.assignment,
      quiz: mod.quiz,
      lessons: processedLessons
    };
  });

  return {
    ...course,
    modules: processedModules
  };
};


export const enrollService = {
  enrollCourse,
  getMyEnrollments,
  getEnrolledCourseContent,
};
