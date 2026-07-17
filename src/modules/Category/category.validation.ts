import * as yup from "yup";
import { isValidObjectId } from "mongoose";

const getAllCategoriesQuerySchema = yup.object({
  search: yup.string().optional().trim(),
  catId: yup
    .string()
    .optional()
    .trim()
    .test("isValidObjectId", "categoryId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
  slug: yup
    .string()
    .optional()
    .trim()
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase letters, numbers, and hyphens)",
    ),
  parent: yup
    .string()
    .optional()
    .trim()
    .test(
      "parent-is-valid-objectid",
      "Parent category ID must be a valid MongoDB ObjectId",
      (value) => !value || isValidObjectId(value),
    ),

  level: yup
    .string()
    .optional()
    .length(1, "Level must be a single character")
    .oneOf(
      ["0", "1", "2"],
      "Level must be 0 (Root Category), 1 (Child Category), or 2 (Grandchild Category)",
    ),

  isActive: yup.string().optional().oneOf(["true", "false"], "isActive must be true or false"),
  sort: yup
    .string()
    .optional()
    .oneOf(["asc", "desc"], "Sort value must be asc or desc"),
  limit: yup
    .number()
    .optional()
    .integer("Limit must be a positive integer")
    .positive("Limit must be a positive integer")
    .max(100, "Maximum allowed limit is 100"),
  page: yup
    .number()
    .optional()
    .integer("Page must be a positive integer")
    .positive("Page must be a positive integer"),
});

const createCategorySchema = yup.object({
  name: yup
    .string()
    .required("Category name is required")
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters"),
  slug: yup
    .string()
    .required("Category slug is required")
    .trim()
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase letters, numbers, and hyphens)",
    ),
  description: yup
    .string()
    .optional()
    .trim()
    .max(500, "Description must be at most 500 characters"),
  parent: yup
    .string()
    .optional()
    .test(
      "parent-is-valid-objectid",
      "Parent category ID must be a valid MongoDB ObjectId",
      (value) => !value || isValidObjectId(value),
    ),
  isActive: yup.boolean().optional().default(true),
  order: yup
    .number()
    .optional()
    .integer("Order must be an integer")
    .min(0, "Order must be zero or greater"),
});

const updateCategorySchema = yup.object({
  // TODO
});

const deleteCategorySchema = yup.object({
  // TODO
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
  getAllCategoriesQuerySchema,
  createCategorySchema,
  slugParamsSchema,
  updateCategorySchema,
  deleteCategorySchema,
};
