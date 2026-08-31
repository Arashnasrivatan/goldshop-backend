import express, { Router } from "express";

import authGuard from "../../common/middlewares/authGuard";
import roleGuard from "../../common/middlewares/roleGuard";
import validate from "../../common/middlewares/validate";
import {
  deleteOrderSchema,
  getAllOrdersQuerySchema,
  orderIdParamsSchema,
  updateOrderSchema,
  getMyOrdersSchema,
} from "./order.validation";
import OrderRepository from "./order.repository";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";

const orderRepository = new OrderRepository();

const orderService = new OrderService(orderRepository);

const orderController = new OrderController(orderService);

const router: Router = express.Router();

router.route("/me").get(authGuard, validate(getMyOrdersSchema), orderController.getMyOrders);

router
  .route("/me/:orderId")
  .get(
    authGuard,
    validate(orderIdParamsSchema, "params"),
    orderController.getMyOrderById,
  );

router
  .route("/")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(getAllOrdersQuerySchema, "query"),
    orderController.getAllOrders,
  );

router
  .route("/:orderId")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(orderIdParamsSchema, "params"),
    orderController.getOrderById,
  )
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(orderIdParamsSchema, "params"),
    validate(updateOrderSchema),
    orderController.updateOrder,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(orderIdParamsSchema, "params"),
    validate(deleteOrderSchema),
    orderController.deleteOrder,
  );

export default router;
