import express, { Router } from "express";

import authGuard from "../../common/middlewares/authGuard";
import validate from "../../common/middlewares/validate";

import { CheckoutRepository } from "./checkout.repository";
import { CheckoutService } from "./checkout.service";
import { CheckoutController } from "./checkout.controller";

import {
  createCheckoutSchema,
  verifyCheckoutSchema,
} from "./checkout.validation";

const checkoutRepository = new CheckoutRepository();

const checkoutService = new CheckoutService(checkoutRepository);

const checkoutController = new CheckoutController(checkoutService);

const router: Router = express.Router();

//* Routes

router
  .route("/")
  .post(
    authGuard,
    validate(createCheckoutSchema),
    checkoutController.createCheckout,
  );

router
  .route("/verify")
  .get(
    authGuard,
    validate(verifyCheckoutSchema, "query"),
    checkoutController.verifyCheckout,
  );

export default router;
