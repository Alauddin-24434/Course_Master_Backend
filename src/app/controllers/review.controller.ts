import { Request, Response } from "express";
import { reviewService } from "../services/review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { content, rating } = req.body;
    const result = await reviewService.createReview({ content, rating, userId });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReviews = async (req: Request, res: Response) => {
  try {
    const result = await reviewService.getAllReviews();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    await reviewService.deleteReview(id as string, userId);

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewController = {
  createReview,
  getAllReviews,
  deleteReview
};
