import { CustomAppError } from "../errors/customError";
import { prisma } from "../config/prisma";
import { SubmissionType } from "@prisma/client";

/**
 * Handle Assignment operations for student tasks and curriculum management
 */
export const assignmentService = {
  /**
   * Create or update an assessment assignment for a specific lesson
   * 
   * This service manages the creation and modification of assignment 
   * instructions linked directly to an individual instructional lesson.
   * 
   * @param payload - Assessment details including lessonId, description and submission type
   * @returns The newly updated or created assignment record
   */
  createAssignment: async (payload: { 
    lessonId: string, 
    description: string, 
    submissionType: SubmissionType | string 
  }) => {
    const { lessonId, description, submissionType } = payload;

    // Verify the target lesson existence in our relational structure
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new CustomAppError(404, "Target lesson context not found for assignment creation");
    }

    // Persist assignment record using relational UPSERT to handle both initial creation and later updates
    return await prisma.assignment.upsert({
      where: { lessonId },
      update: { 
        description, 
        submissionType: submissionType as SubmissionType 
      },
      create: { 
        lessonId, 
        description, 
        submissionType: (submissionType as SubmissionType) || SubmissionType.text 
      }
    });
  }
};