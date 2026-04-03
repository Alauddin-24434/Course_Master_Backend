import { CustomAppError } from "../errors/customError";
import { prisma } from "../config/prisma";

/**
 * Handle Quiz operations for students and administrative curriculum management
 */
export const quizService = {
  /**
   * Create or update a full quiz for a specific lesson
   * 
   * This operation manages both the Quiz entity and its multiple related Questions.
   * It uses a database transaction to ensure that the quiz structure remains consistent.
   * 
   * @param payload - Course/Module context and the quiz structure (questions, options, etc.)
   * @returns The newly created or updated quiz record with its questions
   */
  createQuiz: async (payload: any) => {
    // In our new relational model, we prefer lessonId for precise targeting
    const { lessonId, quiz } = payload;

    // Verify the target lesson exists in our database
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new CustomAppError(404, "Module/Lesson mismatch: Target lesson not found");
    }

    // Atomic transaction for quiz data persistence
    return await prisma.$transaction(async (tx) => {
      // 1. Create or Find the main Quiz container for the lesson
      const quizContainer = await tx.quiz.upsert({
        where: { lessonId },
        update: {}, // No updates needed for the container itself
        create: { lessonId }
      });

      // 2. Clear existing questions to perform a full overwrite with new content
      await tx.quizQuestion.deleteMany({
        where: { quizId: quizContainer.id }
      });

      // 3. Perform a bulk insert of new questions
      await tx.quizQuestion.createMany({
        data: quiz.questions.map((q: any) => ({
          quizId: quizContainer.id,
          question: q.question,
          options: q.options,
          correctAnswer: Number(q.correctAnswer)
        }))
      });

      // 4. Return the fully populated quiz with its new questions
      return await tx.quiz.findUnique({
        where: { id: quizContainer.id },
        include: { questions: true }
      });
    });
  }
};
