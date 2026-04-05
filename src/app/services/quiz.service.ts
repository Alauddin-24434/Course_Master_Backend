import { prisma } from "../../lib/prisma";
import { CustomAppError } from "../errors/customError";
import { Prisma } from "@prisma/client";

export const quizService = {
  /**
   * Create or update quiz
   */
  createQuiz: async (payload: any) => {
    const { moduleId, quiz } = payload;

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new CustomAppError(404, "Module not found");
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const quizContainer = await tx.quiz.upsert({
        where: { moduleId },
        update: {},
        create: { moduleId },
      });

      await tx.quizQuestion.deleteMany({
        where: { quizId: quizContainer.id },
      });

      await tx.quizQuestion.createMany({
        data: quiz.questions.map((q: any) => ({
          quizId: quizContainer.id,
          question: q.question,
          options: q.options,
          correctAnswer: Number(q.correctAnswer),
        })),
      });

      return await tx.quiz.findUnique({
        where: { id: quizContainer.id },
        include: {
          questions: true,
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
    });
  },

  /**
   * ✅ GET ONLY instructor's quizzes
   */
  getQuizzesByInstructor: async (instructorId: string) => {
    return await prisma.quiz.findMany({
      where: {
        module: {
          course: {
            instructorId: instructorId, // 🔥 MAIN FILTER
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
        questions: true,
      },
    });
  },

  /**
   * Delete quiz
   */
  deleteQuiz: async (id: string) => {
    return await prisma.quiz.delete({
      where: { id },
    });
  },

  /**
   * Update quiz
   */
  updateQuiz: async (id: string, payload: any) => {
    return quizService.createQuiz(payload);
  },

  /**
   * Submit quiz answers (student)
   * payload: { quizId, answers: number[] } — answers[i] is the selected option index for question i
   */
  submitQuiz: async (quizId: string, userId: string, answers: number[]) => {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new CustomAppError(404, "Quiz not found");
    }

    // Auto-grade
    let score = 0;
    const total = quiz.questions.length;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });

    const submission = await prisma.quizSubmission.create({
      data: {
        quizId,
        userId,
        score,
        total,
      },
    });

    return { score, total, percentage: total > 0 ? Math.round((score / total) * 100) : 0, submission };
  },
};