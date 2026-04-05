import { Request, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { userService } from "../services/user.service";

export const getAllUsers = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    sendResponse(res, 200, "Users retrieved successfully", users);
  }
);

export const becomeInstructor = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await userService.becomeInstructor(userId);
    sendResponse(res, 200, "Success: You are now an instructor!");
  }
);

