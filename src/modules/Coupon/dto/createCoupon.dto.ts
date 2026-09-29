import { CouponScope, CouponType } from "../coupon.types";

export class CreateCouponDto {
  public code: string;
  public type: CouponType;
  public value: number;
  public maxDiscountAmount?: number | null;
  public minOrderAmount?: number;
  public scope?: CouponScope;
  public productIds?: string[];
  public categoryIds?: string[];
  public startsAt?: Date | string | null;
  public expiresAt?: Date | string | null;
  public usageLimit?: number | null;
  public perUserLimit?: number | null;
  public isActive?: boolean;

  constructor(data: {
    code: string;
    type: CouponType;
    value: number;
    maxDiscountAmount?: number | null;
    minOrderAmount?: number;
    scope?: CouponScope;
    productIds?: string[];
    categoryIds?: string[];
    startsAt?: Date | string | null;
    expiresAt?: Date | string | null;
    usageLimit?: number | null;
    perUserLimit?: number | null;
    isActive?: boolean;
  }) {
    this.code = data.code;
    this.type = data.type;
    this.value = data.value;
    this.maxDiscountAmount = data.maxDiscountAmount;
    this.minOrderAmount = data.minOrderAmount;
    this.scope = data.scope;
    this.productIds = data.productIds;
    this.categoryIds = data.categoryIds;
    this.startsAt = data.startsAt;
    this.expiresAt = data.expiresAt;
    this.usageLimit = data.usageLimit;
    this.perUserLimit = data.perUserLimit;
    this.isActive = data.isActive;
  }
}
