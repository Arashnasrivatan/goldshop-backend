import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { ICoupon } from "./coupon.types";

export type ICouponDocument = HydratedDocument<ICoupon> & {
  createdAt: Date;
  updatedAt: Date;
};

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 40,
      match: /^[A-Z0-9_-]+$/,
    },
    type: {
      type: String,
      enum: ["PERCENT", "FIXED"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0.01,
      validate: {
        validator: function (this: unknown, value: number) {
          const coupon = this as ICoupon;
          return (
            Number.isFinite(value) && (coupon.type !== "PERCENT" || value <= 100)
          );
        },
        message: "Percentage discount cannot exceed 100.",
      },
    },
    maxDiscountAmount: { type: Number, min: 0, default: null },
    minOrderAmount: { type: Number, required: true, min: 0, default: 0 },
    scope: {
      type: String,
      enum: ["ALL", "JEWELRY", "COIN"],
      required: true,
      default: "ALL",
    },
    productIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
    },
    categoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      default: [],
    },
    startsAt: { type: Date, default: null },
    expiresAt: {
      type: Date,
      default: null,
      validate: {
        validator: function (this: unknown, value: Date | null) {
          const coupon = this as ICoupon;
          return !value || !coupon.startsAt || value > coupon.startsAt;
        },
        message: "Coupon expiry must be after its start date.",
      },
    },
    usageLimit: { type: Number, min: 1, default: null },
    perUserLimit: { type: Number, min: 1, default: null },
    usedCount: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true },
);

CouponSchema.index({ code: 1 }, { unique: true });

const CouponModel: Model<ICoupon> = mongoose.model<ICoupon>(
  "Coupon",
  CouponSchema,
);

export default CouponModel;
