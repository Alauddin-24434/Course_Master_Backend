import express, { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { userController } from "../controllers/user.controller";

const router = express.Router();

router.get("/", protect, authorize("admin"), userController.getAllUsers);
router.post("/become-instructor", protect, userController.becomeInstructor);

export const userRouter : Router= router;

