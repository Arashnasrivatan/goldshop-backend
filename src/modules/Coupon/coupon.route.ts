import express, { Router } from "express";

import authGuard from "../../common/middlewares/authGuard";
import roleGuard from "../../common/middlewares/roleGuard";
import validate from "../../common/middlewares/validate";
import { CouponController } from "./coupon.controller";
import { CouponRepository } from "./coupon.repository";
import { CouponService } from "./coupon.service";
import {
  couponIdParamsSchema,
  createCouponSchema,
  getAllCouponsQuerySchema,
  updateCouponSchema,
} from "./coupon.validation";

const couponRepository = new CouponRepository();
const couponService = new CouponService(couponRepository);
const couponController = new CouponController(couponService);

const router: Router = express.Router();

router
  .route("/")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(getAllCouponsQuerySchema, "query"),
    couponController.getAllCoupons,
  )
  .post(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(createCouponSchema),
    couponController.createCoupon,
  );

router
  .route("/:couponId")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(couponIdParamsSchema, "params"),
    couponController.getCouponById,
  )
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(couponIdParamsSchema, "params"),
    validate(updateCouponSchema),
    couponController.updateCoupon,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(couponIdParamsSchema, "params"),
    couponController.deleteCoupon,
  );

export default router;
