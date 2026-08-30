import express, { Router } from "express";
import { ProductController } from "./product.controller";
import validate from "./../../common/middlewares/validate";
import roleGuard from "./../../common/middlewares/roleGuard";
import authGuard from "../../common/middlewares/authGuard";
import {
  getAllProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  addProductImagesSchema,
  deleteProductImagesSchema,
} from "./product.validaton";
import configs from "../../configs/env.config";
import uploader from "../../common/middlewares/uploader";

import { ProductService } from "./../Product/product.service";
import { ProductRepository } from "../Product/product.repository";
import { CategoryRepository } from "../Category/category.repository";

import S3StorageService from "../../common/services/S3StorageService";
import {
  productIdParamsSchema,
  slugParamsSchema,
} from "../../common/utils/validation/params/sharedValidators";
import { CartRepository } from "../Cart/cart.repository";

const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();
const cartRepository = new CartRepository();

const s3StorageService = new S3StorageService(configs.storage.arvan);

const productService = new ProductService(
  productRepository,
  categoryRepository,
  cartRepository,
  s3StorageService,
);

const productController = new ProductController(productService);

const router: Router = express.Router();

//* Routes
router
  .route("/")
  .get(
    validate(getAllProductsQuerySchema, "query"),
    productController.getAllProducts,
  )
  .post(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    uploader([{ name: "images", type: "image", maxCount: 10 }], 5),
    validate(createProductSchema),
    productController.createProduct,
  );

router
  .route("/slug/:slug")
  .get(
    validate(slugParamsSchema, "params"),
    productController.getProductBySlug,
  );

router
  .route("/:productId")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(productIdParamsSchema, "params"),
    productController.getProductById,
  )
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(productIdParamsSchema, "params"),
    validate(updateProductSchema),
    productController.updateProduct,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(productIdParamsSchema, "params"),
    validate(deleteProductSchema),
    productController.deleteProduct,
  );

router
  .route("/:productId/images")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(productIdParamsSchema, "params"),
    productController.getProductImages,
  )
  .post(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(productIdParamsSchema, "params"),
    uploader([{ name: "images", type: "image", maxCount: 10 }], 5),
    validate(addProductImagesSchema),
    productController.addProductImages,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(productIdParamsSchema, "params"),
    validate(deleteProductImagesSchema),
    productController.deleteProductImages,
  );

export default router;
