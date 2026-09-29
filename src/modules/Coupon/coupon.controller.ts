import { NextFunction, Request, Response } from "express";
import response from "../../common/utils/response";
import { CouponService } from "./coupon.service";
import { CouponBody, CouponType } from "./coupon.types";
import { CreateCouponDto } from "./dto/createCoupon.dto";
import { DeleteCouponDto } from "./dto/deleteCoupon.dto";
import { GetAllCouponsDto } from "./dto/getAllCoupons.dto";
import { GetCouponByIdDto } from "./dto/getCouponById.dto";
import { UpdateCouponDto } from "./dto/updateCoupon.dto";
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  getAllCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = req.query;
      const input = new GetAllCouponsDto({
        page: queryParams.page ? parseInt(queryParams.page as string, 10) : 1,
        limit: queryParams.limit ? parseInt(queryParams.limit as string, 10) : 10,
        search: queryParams.search as string,
        isActive: queryParams.isActive as string,
      });
      const result = await this.couponService.getAllCoupons(input);
      return response(res, 200, result.message, result.data);
    } catch (error) {
      next(error);
    }
  };

  createCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        code, type, value, maxDiscountAmount, minOrderAmount, scope,
        productIds, categoryIds, startsAt, expiresAt, usageLimit,
        perUserLimit, isActive,
      } = req.body as CouponBody;
      const input = new CreateCouponDto({
        code: code as string, type: type as CouponType, value: value as number,
        maxDiscountAmount, minOrderAmount, scope, productIds, categoryIds,
        startsAt, expiresAt, usageLimit, perUserLimit, isActive,
      });
      const result = await this.couponService.createCoupon(input);
      return response(res, 201, result.message, result.data);
    } catch (error) {
      next(error);
    }
  };

  getCouponById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { couponId } = req.params as { couponId: string };
      const input = new GetCouponByIdDto({ couponId });
      const result = await this.couponService.getCouponById(input);
      return response(res, 200, result.message, result.data);
    } catch (error) {
      next(error);
    }
  };

  updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { couponId } = req.params as { couponId: string };
      const {
        code, type, value, maxDiscountAmount, minOrderAmount, scope,
        productIds, categoryIds, startsAt, expiresAt, usageLimit,
        perUserLimit, isActive,
      } = req.body as CouponBody;
      const input = new UpdateCouponDto({
        couponId, code, type, value, maxDiscountAmount, minOrderAmount,
        scope, productIds, categoryIds, startsAt, expiresAt, usageLimit,
        perUserLimit, isActive,
      });
      const result = await this.couponService.updateCoupon(input);
      return response(res, 200, result.message, result.data);
    } catch (error) {
      next(error);
    }
  };

  deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { couponId } = req.params as { couponId: string };
      const input = new DeleteCouponDto({ couponId });
      const result = await this.couponService.deleteCoupon(input);
      return response(res, 200, result.message, result.data);
    } catch (error) {
      next(error);
    }
  };
}
