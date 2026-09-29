import { Types } from "mongoose";

export type CouponType = "PERCENT" | "FIXED";
export type CouponScope = "ALL" | "JEWELRY" | "COIN";

export interface ICouponFilter {
  search?: string;
  isActive?: string;
}

export interface ICoupon {
  code: string;
  type: CouponType;
  value: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  scope: CouponScope;
  productIds: Types.ObjectId[];
  categoryIds: Types.ObjectId[];
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  usedCount: number;
  isActive: boolean;
  reservationVersion?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CouponBody = {
  code?: string;
  type?: CouponType;
  value?: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number;
  scope?: CouponScope;
  productIds?: string[];
  categoryIds?: string[];
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive?: boolean;
};
