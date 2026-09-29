import { AppError } from "../../common/errors/AppError";
import { createPaginationData } from "../../common/utils";
import { CouponRepository } from "./coupon.repository";
import { CreateCouponDto } from "./dto/createCoupon.dto";
import { DeleteCouponDto } from "./dto/deleteCoupon.dto";
import { GetAllCouponsDto } from "./dto/getAllCoupons.dto";
import { GetCouponByIdDto } from "./dto/getCouponById.dto";
import { UpdateCouponDto } from "./dto/updateCoupon.dto";

const rethrowDuplicateCode = (error: unknown): never => {
  if (error && typeof error === "object" && "code" in error && error.code === 11000) {
    throw new AppError("Coupon code already exists", 409);
  }
  throw error;
};

export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  async getAllCoupons(input: GetAllCouponsDto) {
    const { data: coupons, meta } = await this.couponRepository.findAll(
      { search: input.search, isActive: input.isActive },
      input.limit ?? 10,
      input.page ?? 1,
    );
    const paginationData = createPaginationData(
      meta.page, meta.limit, meta.total, "Coupons",
    );
    return {
      message: "Coupons fetched successfully",
      data: { paginationData, coupons },
    };
  }

  async createCoupon(input: CreateCouponDto) {
    const code = input.code?.trim().toUpperCase();
    if (!code) throw new AppError("Coupon code is required", 400);
    if (await this.couponRepository.findByCode(code)) {
      throw new AppError("Coupon code already exists", 409);
    }

    try {
      input.code = code;
      const coupon = await this.couponRepository.create(input);
      return { message: "Coupon created successfully", data: coupon };
    } catch (error) {
      return rethrowDuplicateCode(error);
    }
  }

  async getCouponById(input: GetCouponByIdDto) {
    const coupon = await this.couponRepository.findById(input.couponId);
    if (!coupon) throw new AppError("Coupon not found", 404);
    return { message: "Coupon fetched successfully", data: coupon };
  }

  async updateCoupon(input: UpdateCouponDto) {
    const coupon = await this.couponRepository.findById(input.couponId);
    if (!coupon) throw new AppError("Coupon not found", 404);

    const code = input.code?.trim().toUpperCase();
    if (code && code !== coupon.code) {
      const existing = await this.couponRepository.findByCode(code);
      if (existing) throw new AppError("Coupon code already exists", 409);
    }

    const {
      type, value, maxDiscountAmount, minOrderAmount, scope,
      productIds, categoryIds, startsAt, expiresAt, usageLimit,
      perUserLimit, isActive,
    } = input;
    const updateData = {
      code, type, value, maxDiscountAmount, minOrderAmount, scope,
      productIds, categoryIds, startsAt, expiresAt, usageLimit,
      perUserLimit, isActive,
    };
    const providedFields = Object.entries(updateData).filter(
      ([, fieldValue]) => fieldValue !== undefined,
    );
    if (providedFields.length === 0) {
      throw new AppError("At least one field must be provided", 400);
    }

    coupon.set(Object.fromEntries(providedFields));
    if (coupon.type === "PERCENT" && coupon.value > 100) {
      throw new AppError("Percentage discount cannot exceed 100", 400);
    }
    if (coupon.startsAt && coupon.expiresAt && coupon.expiresAt <= coupon.startsAt) {
      throw new AppError("Expiry must be after the start date", 400);
    }
    try {
      const updated = await this.couponRepository.save(coupon);
      return { message: "Coupon updated successfully", data: updated };
    } catch (error) {
      return rethrowDuplicateCode(error);
    }
  }

  async deleteCoupon(input: DeleteCouponDto) {
    const coupon = await this.couponRepository.findById(input.couponId);
    if (!coupon) throw new AppError("Coupon not found", 404);

    coupon.isActive = false;
    const updated = await this.couponRepository.save(coupon);
    return { message: "Coupon deactivated successfully", data: updated };
  }
}
