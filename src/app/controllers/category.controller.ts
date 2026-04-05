import { Request, Response } from "express";
import { catchAsyncHandler } from "../utils/catchAsyncHandler";
import { categoryService } from "../services/category.service";
import { sendResponse } from "../utils/sendResponse"; // make sure path is correct

// ==============================
// GET all categories
// ==============================
const getCategories = catchAsyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  sendResponse(res, 200, "Categories fetched successfully", categories);
});

// ==============================
// CREATE a category
// ==============================
const createCategory = catchAsyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  sendResponse(res, 201, "Category created successfully", category);
});

// ==============================
// UPDATE a category
// ==============================
const updateCategory = catchAsyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id as string, req.body);
  sendResponse(res, 200, "Category updated successfully", category);
});

// ==============================
// DELETE a category
// ==============================
const deleteCategory = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.deleteCategory(req.params.id as string);
  sendResponse(res, 200, "Category deleted successfully", result);
});

export const categoryController = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
