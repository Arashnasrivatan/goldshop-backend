import express, { Router } from "express";
import { CategoryController } from "./category.controller";
import validate from "./../../common/middlewares/validate";
import roleGuard from "./../../common/middlewares/roleGuard";
import authGuard from "../../common/middlewares/authGuard";
import {
  getAllCategoriesQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  slugParamsSchema,
} from "./category.validation";

import { CategoryService } from "./../Category/category.service";
import { CategoryRepository } from "../Category/category.repository";
import { categoryIdParamsSchema } from "../../common/utils/validation/params/sharedValidators";

const categoryRepository = new CategoryRepository();

const categoryService = new CategoryService(categoryRepository);

const categoryController = new CategoryController(categoryService);

const router: Router = express.Router();

//* Routes
router
  .route("/slug/:slug")
  .get(
    validate(slugParamsSchema, "params"),
    categoryController.getCategoryBySlug,
  );

router.route("/tree").get(categoryController.getCategoryTree);

router
  .route("/")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(getAllCategoriesQuerySchema, "query"),
    categoryController.getAllCategories,
  )
  .post(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(createCategorySchema),
    categoryController.createCategory,
  );

router
  .route("/:categoryId")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(categoryIdParamsSchema, "params"),
    categoryController.getCategoryById,
  )
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(categoryIdParamsSchema, "params"),
    validate(updateCategorySchema),
    categoryController.updateCategory,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(categoryIdParamsSchema, "params"),
    validate(deleteCategorySchema),
    categoryController.deleteCategory,
  );

export default router;
