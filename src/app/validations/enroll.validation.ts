import { z } from "zod";

export const enrollValidation = z.object({
  courseId: z.string().uuid("Invalid course ID (UUID format)"),
});
