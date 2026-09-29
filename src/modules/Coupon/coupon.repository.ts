import { ClientSession, HydratedDocument, Types } from "mongoose";
import CouponModel from "./coupon.model";
import { ICoupon, ICouponFilter } from "./coupon.types";
import { CreateCouponDto } from "./dto/createCoupon.dto";

export class CouponRepository {
  findByCode(code: string) {
    return CouponModel.findOne({ code });
  }

  lockForCheckout(code: string, session: ClientSession) {
    return CouponModel.findOneAndUpdate(
      { code, isActive: true },
      { $inc: { reservationVersion: 1 } },
      { new: true, session, timestamps: false },
    );
  }

  recordUsage(couponId: string, session: ClientSession) {
    return CouponModel.findByIdAndUpdate(
      couponId,
      { $inc: { usedCount: 1 } },
      { new: true, session },
    );
  }

  findById(couponId: string) {
    return CouponModel.findById(couponId);
  }

  async findAll(filters: ICouponFilter = {}, limit = 10, page = 1) {
    const query: { code?: string; isActive?: boolean } = {};

    if (filters.search) query.code = filters.search.trim().toUpperCase();
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === "true";
    }

    const [data, total] = await Promise.all([
      CouponModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CouponModel.countDocuments(query),
    ]);

    return {
      data,
      meta: { page, limit, total },
    };
  }

  create(input: CreateCouponDto) {
    const {
      code, type, value, maxDiscountAmount, minOrderAmount, scope,
      productIds, categoryIds, startsAt, expiresAt, usageLimit,
      perUserLimit, isActive,
    } = input;
    return CouponModel.create({
      code, type, value, maxDiscountAmount, minOrderAmount, scope,
      productIds: productIds?.map((id) => new Types.ObjectId(id)),
      categoryIds: categoryIds?.map((id) => new Types.ObjectId(id)),
      startsAt: startsAt ? new Date(startsAt) : startsAt,
      expiresAt: expiresAt ? new Date(expiresAt) : expiresAt,
      usageLimit,
      perUserLimit, isActive,
    });
  }

  save(coupon: HydratedDocument<ICoupon>) {
    return coupon.save();
  }
}
