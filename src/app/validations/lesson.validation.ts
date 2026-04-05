import { z } from "zod";

export const createLessonValidation = z.object({
  moduleId: z.string().uuid("Invalid module ID"),
  title: z.string().min(1, "Title is required"),
  videoUrl: z.string().url("Invalid video URL"),
  duration: z.number().min(0, "Duration cannot be negative"),
});

export const updateLessonValidation = z.object({
  title: z.string().min(1, "Title is too short").optional(),
  videoUrl: z.string().url("Invalid video URL").optional(),
  duration: z.number().min(0, "Duration cannot be negative").optional(),
});
