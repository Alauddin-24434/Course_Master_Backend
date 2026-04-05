import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { getAllUsers, becomeInstructor } from "../controllers/user.controller";

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllUsers);
router.post("/become-instructor", protect, becomeInstructor);

export const userRouter = router;

