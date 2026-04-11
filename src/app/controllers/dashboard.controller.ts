import { Request, RequestHandler, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { sendResponse } from "../utils/sendResponse";
import { dashboardService } from "../services/dashboard.service";
import { IUser } from "../interfaces/user.interface";

/**
 * Handle Dashboard data requests
 * Dispatches analytics gathering based on the authenticated user's role.
 */
const getDashboardAnalytics = catchAsyncHandler(
  async (req: Request, res: Response) => {
    // Identity provided by the 'protect' middleware
    const user = req.user as IUser;

    // Delegate role-specific analytical logic to the service layer
    const analyticsData = await dashboardService.getDashboardAnalytics(user);

    // Provide a consistent response with the aggregated data
    sendResponse(res, 200, "Dashboard analytics successfully retrieved", analyticsData);
  }
);


export const dashboardController:DashboardController = {
  getDashboardAnalytics,
};

type DashboardController = {
  getDashboardAnalytics:  RequestHandler;
}