import express, { Router } from "express";

import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartRepository } from "./cart.repository";

import validate from "../../common/middlewares/validate";
import authGuard from "../../common/middlewares/authGuard";

import { addCartItemSchema, updateCartItemSchema } from "./cart.validation";

import { productIdParamsSchema } from "../../common/utils/validation/params/sharedValidators";
import { UserRepository } from "./../User/user.repository";
import { ProductRepository } from "../Product/product.repository";

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const userRepository = new UserRepository();

const cartService = new CartService(
  cartRepository,
  productRepository,
  userRepository,
);

const cartController = new CartController(cartService);

const router: Router = express.Router();

//* Routes

router.use(authGuard);

router.route("/").get(cartController.getCart).delete(cartController.clearCart);

router
  .route("/items")
  .post(validate(addCartItemSchema), cartController.addItem);

router
  .route("/items/:productId")
  .patch(
    validate(productIdParamsSchema, "params"),
    validate(updateCartItemSchema),
    cartController.updateItem,
  )
  .delete(validate(productIdParamsSchema, "params"), cartController.removeItem);

export default router;
