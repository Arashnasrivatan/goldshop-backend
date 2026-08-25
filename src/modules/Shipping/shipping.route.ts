import express, { Router } from "express";

import { ShippingController } from "./shipping.controller";
import { ShippingService } from "./shipping.service";
import { ShippingRepository } from "./shipping.repository";

import validate from "../../common/middlewares/validate";
import roleGuard from "../../common/middlewares/roleGuard";
import authGuard from "../../common/middlewares/authGuard";
import configs from "../../configs/env.config";

import {
  createShippingSchema,
  updateShippingSchema,
  getAllShippingQuerySchema,
} from "./shipping.validation";

import { shippingIdParamsSchema } from "../../common/utils/validation/params/sharedValidators";
import S3StorageService from "../../common/services/S3StorageService";

const shippingRepository = new ShippingRepository();

const s3StorageService = new S3StorageService(configs.storage.arvan);

const shippingService = new ShippingService(
  shippingRepository,
  s3StorageService,
);

const shippingController = new ShippingController(shippingService);

const router: Router = express.Router();

//* Routes

//* Public Routes

router
  .route("/")
  .get(
    validate(getAllShippingQuerySchema, "query"),
    shippingController.getActiveShippingMethods,
  );

//* Admin Routes

router
  .route("/manage")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(getAllShippingQuerySchema, "query"),
    shippingController.getAllShippingMethods,
  )
  .post(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(createShippingSchema),
    shippingController.createShippingMethod,
  );

router
  .route("/:shippingId")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(shippingIdParamsSchema, "params"),
    shippingController.getShippingMethodById,
  )
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(shippingIdParamsSchema, "params"),
    validate(updateShippingSchema),
    shippingController.updateShippingMethod,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(shippingIdParamsSchema, "params"),
    shippingController.deleteShippingMethod,
  );

export default router;
