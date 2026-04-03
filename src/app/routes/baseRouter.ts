// ==============================
// BASE ROUTER
// ==============================
import { Router } from "express";
import { authRouter } from "./auth.route";
import { courseRouter } from "./course.route";
import { categoryRouter } from "./category.route";
import { moduleRouter } from "./module.routes";
import { assignmentRouter } from "./assignment.routes";
import { quizRouter } from "./quiz.routes";
import { dashboardRouter } from "./dashboard.route";

const router = Router();

// Define all main route paths and their corresponding routers
const routes = [
  { path: "/auth", handler: authRouter },          // Auth routes: signup, login, refresh token
  { path: "/courses", handler: courseRouter },     // Courses routes: CRUD, enroll, complete lessons
  { path: "/categories", handler: categoryRouter },// Categories routes: CRUD
  { path: "/modules", handler: moduleRouter },     // Modules & Lessons routes: add, get, update
  { path: "/assignments", handler: assignmentRouter }, // Assignment routes: create assignments
  { path: "/quizs", handler: quizRouter },         // Quiz routes: create quiz
   { path: "/dashboard", handler: dashboardRouter },    
];

// Attach each router to its path
routes.forEach((route) => {
  router.use(route.path, route.handler);
});

// Export the base router to use in app.ts or server.ts
export const baseRouter = router;
