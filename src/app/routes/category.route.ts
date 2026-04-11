import { Router } from "express";
import { categoryController } from "../controllers/category.controller";

const router = Router();

// ==============================
// GET /categories
// ==============================
// Fetch all categories
router.get("/", categoryController.getCategories);

// ==============================
// POST /categories
// ==============================
// Create a new category
router.post("/", categoryController.createCategory);

// ==============================
// PUT /categories/:id
// ==============================
// Update a specific category by ID
router.put("/:id", categoryController.updateCategory);

// ==============================
// DELETE /categories/:id
// ==============================
// Delete a specific category by ID
router.delete("/:id", categoryController.deleteCategory);

export const categoryRouter : Router= router;
