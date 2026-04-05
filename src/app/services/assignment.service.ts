import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";
import { SubmissionType } from "../interfaces/assignment.interface";

/**
 * Create or update assignment
 */
const createAssignment = async (payload: {
  moduleId: string;
  description: string;
  submissionType: SubmissionType | string;
}) => {
  const { moduleId, description, submissionType } = payload;

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!module) {
    throw new CustomAppError(404, "Module not found");
  }

  const assignment = await prisma.assignment.upsert({
    where: { moduleId },
    update: {
      description,
      submissionType: submissionType as SubmissionType,
    },
    create: {
      moduleId,
      description,
      submissionType:
        (submissionType as SubmissionType) || SubmissionType.text,
    },
  });

  return assignment;
};

/**
 * Get all assignments
 */
const getAssignmentsIntoIntrutorCourses = async (instructorId: string) => {
  return await prisma.assignment.findMany({
    where: {
      module: {
        course: {
          instructorId: instructorId, // ✅ IMPORTANT
        },
      },
    },
    include: {
      module: {
        select: {
          title: true,
          course: {
            select: { title: true },
          },
        },
      },
    },
  });
};

/**
 * Update assignment
 */
const updateAssignment = async (
  id: string,
  payload: Partial<{
    description: string;
    submissionType: SubmissionType | string;
  }>
) => {
  return await prisma.assignment.update({
    where: { id },
    data: {
      ...(payload.description && { description: payload.description }),
      ...(payload.submissionType && {
        submissionType: payload.submissionType as SubmissionType,
      }),
    },
  });
};

/**
 * Delete assignment
 */
const deleteAssignment = async (id: string) => {
  return await prisma.assignment.delete({
    where: { id },
  });
};



/**
 * Submit assignment
 */
const submitAssignment = async (assignmentId: string, userId: string, content: string) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });

  if (!assignment) {
    throw new CustomAppError(404, "Assignment not found");
  }

  const submission = await prisma.assignmentSubmission.upsert({
    where: {
      userId_assignmentId: {
        userId,
        assignmentId
      }
    },
    update: {
      content,
      status: "submitted"
    },
    create: {
      userId,
      assignmentId,
      content,
    }
  });

  return submission;
};

// ✅ Bottom Export
export const AssignmentService = {
  createAssignment,
  getAssignmentsIntoIntrutorCourses,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
};