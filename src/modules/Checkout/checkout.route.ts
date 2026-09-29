import express, { Router } from "express";

import authGuard from "../../common/middlewares/authGuard";
import validate from "../../common/middlewares/validate";

import { CheckoutRepository } from "./checkout.repository";
import { CartRepository } from "../Cart/cart.repository";
import { OrderRepository } from "../Order/order.repository";
import { ProductRepository } from "../Product/product.repository";
import { ShippingRepository } from "../Shipping/shipping.repository";
import { UserRepository } from "../User/user.repository";
import { PriceRepository } from "../Price/price.repository";
import { CouponRepository } from "../Coupon/coupon.repository";
import { CategoryRepository } from "../Category/category.repository";

import { CheckoutService } from "./checkout.service";
import { CheckoutController } from "./checkout.controller";

import {
  createCheckoutSchema,
  verifyCheckoutSchema,
} from "./checkout.validation";

const checkoutRepository = new CheckoutRepository();
const cartRepository = new CartRepository();
const orderRepository = new OrderRepository();
const productRepository = new ProductRepository();
const shippingRepository = new ShippingRepository();
const userRepository = new UserRepository();
const priceRepository = new PriceRepository();
const couponRepository = new CouponRepository();
const categoryRepository = new CategoryRepository();

const checkoutService = new CheckoutService(
  checkoutRepository,
  cartRepository,
  orderRepository,
  productRepository,
  shippingRepository,
  userRepository,
  priceRepository,
  couponRepository,
  categoryRepository,
);

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
  .route("/preview")
  .post(
    authGuard,
    validate(createCheckoutSchema),
    checkoutController.previewCheckout,
  );

router
  .route("/verify")
  .get(
    authGuard,
    validate(verifyCheckoutSchema, "query"),
    checkoutController.verifyCheckout,
  );

export default router;
