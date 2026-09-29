import { isValidObjectId } from "mongoose";
import * as yup from "yup";

const objectId = yup
  .string()
  .test("object-id", "Invalid ID", (value) => !value || isValidObjectId(value));

const couponFields = {
  code: yup.string().trim().uppercase().matches(/^[A-Z0-9_-]{3,40}$/, "Invalid coupon code"),
  type: yup.string().oneOf(["PERCENT", "FIXED"]),
  value: yup.number().typeError("Value must be a number").positive(),
  maxDiscountAmount: yup.number().typeError("Maximum discount must be a number").min(0).nullable(),
  minOrderAmount: yup.number().typeError("Minimum order amount must be a number").min(0),
  scope: yup.string().oneOf(["ALL", "JEWELRY", "COIN"]),
  productIds: yup.array().of(objectId.required()),
  categoryIds: yup.array().of(objectId.required()),
  startsAt: yup.date().nullable(),
  expiresAt: yup.date().nullable(),
  usageLimit: yup.number().integer().min(1).nullable(),
  perUserLimit: yup.number().integer().min(1).nullable(),
  isActive: yup.boolean(),
};

const createCouponSchema = yup
  .object({
    ...couponFields,
    code: couponFields.code.required("Coupon code is required"),
    type: couponFields.type.required("Coupon type is required"),
    value: couponFields.value.required("Coupon value is required"),
  })
  .test("percent-range", "Percentage discount cannot exceed 100", (value) =>
    value?.type !== "PERCENT" || value.value <= 100,
  )
  .test("date-range", "Expiry must be after the start date", (value) =>
    !value?.startsAt || !value.expiresAt || value.expiresAt > value.startsAt,
  );

const updateCouponSchema = yup
  .object(couponFields)
  .test("not-empty", "At least one field must be provided", (value) =>
    Boolean(value && Object.keys(value).length > 0),
  );

const couponIdParamsSchema = yup.object({
  couponId: objectId.required("Coupon ID is required"),
});

const getAllCouponsQuerySchema = yup.object({
  page: yup.number().integer().min(1).max(100000).optional(),
  limit: yup.number().integer().min(1).max(100).optional(),
  search: yup.string().trim().max(40).optional(),
  isActive: yup.string().oneOf(["true", "false"]).optional(),
});

export {
  createCouponSchema,
  updateCouponSchema,
  couponIdParamsSchema,
  getAllCouponsQuerySchema,
};
