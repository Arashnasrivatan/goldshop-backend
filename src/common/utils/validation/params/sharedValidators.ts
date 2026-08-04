import { isValidObjectId } from "mongoose";
import * as yup from "yup";

const userIdParamsSchema = yup.object().shape({
  userId: yup
    .string()
    .required("userId is required")
    .test("isValidObjectId", "userId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
});

const categoryIdParamsSchema = yup.object().shape({
  categoryId: yup
    .string()
    .required("categoryId is required")
    .test("isValidObjectId", "categoryId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
});

const productIdParamsSchema = yup.object().shape({
  productId: yup
    .string()
    .required("productId is required")
    .test("isValidObjectId", "productId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
});

const slugParamsSchema = yup.object({
  slug: yup
    .string()
    .required("Category slug is required")
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase letters, numbers, and hyphens)",
    ),
});

export {
  userIdParamsSchema,
  categoryIdParamsSchema,
  productIdParamsSchema,
  slugParamsSchema,
};
