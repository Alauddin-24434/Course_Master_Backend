import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";
import { IUser } from "../interfaces/user.inteface";

/**
 * Service to aggregate analytical insights and statistics 
 * displayed in the user's personal dashboard.
 */
export const dashboardService = {
  /**
   * Aggregate core statistics for the authenticated user based on their role
   * 
   * Provides different analytical views for Administrators (overall platform metrics) 
   * versus Students (personal progress records).
   * 
   * @param user - Object representing the currently logged-in user
   * @returns Detailed statistics tailored to the specific user role
   */
  async getDashboardAnalytics(user: IUser) {
    const role = user.role as Role;

    // ------------ ADMINISTRATOR ANALYTICS OVERVIEW ------------
    if (role === Role.admin) {
      // Perform parallel count operations to minimize database response time
      const [totalStudents, totalCourses] = await Promise.all([
        prisma.user.count({ where: { role: Role.student } }),
        prisma.course.count()
      ]);

      return {
        role,
        statistics: {
          totalStudents,
          totalCourses
        },
        message: "Full administrative overview generated for dashboard"
      };
    }

    // ------------ PERSONALIZED STUDENT DASHBOARD ------------
    if (role === Role.student) {
      const userId = user.id;

      // Efficiently count enrollment records and total platform courses for user comparison
      const [myEnrolledCount, totalAvailableCount] = await Promise.all([
        prisma.enrollment.count({ where: { userId } }),
        prisma.course.count({ where: { isPublished: true } }) // Only count courses available for students
      ]);

      return {
        role,
        statistics: {
          myCourses: myEnrolledCount,
          totalCourses: totalAvailableCount
        },
        message: "Student activity dashboard snapshot ready"
      };
    }

    // ------------ DEFAULT / GUEST FALLBACK ------------
    return {
      role,
      message: "No specific analytical data is available for this role"
    };
  },
};
