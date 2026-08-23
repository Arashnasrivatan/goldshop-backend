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
} from "./category.validation";
import configs from "../../configs/env.config";
import uploader from "../../common/middlewares/uploader";

import { CategoryService } from "./../Category/category.service";
import { CategoryRepository } from "../Category/category.repository";
import S3StorageService from "../../common/services/S3StorageService";
import {
  categoryIdParamsSchema,
  slugParamsSchema,
} from "../../common/utils/validation/params/sharedValidators";
import { ProductRepository } from "../Product/product.repository";

const categoryRepository = new CategoryRepository();
const productRepository = new ProductRepository();

const s3StorageService = new S3StorageService(configs.storage.arvan);

const categoryService = new CategoryService(
  categoryRepository,
  s3StorageService,
  productRepository,
);

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
    uploader([{ name: "image", type: "image", maxCount: 1 }], 5),
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
    uploader([{ name: "image", type: "image", maxCount: 1 }], 5),
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
