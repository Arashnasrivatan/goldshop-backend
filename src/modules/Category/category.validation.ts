import * as yup from "yup";
import { isValidObjectId } from "mongoose";

const emptyStringToUndefined = (
  value: unknown,
  originalValue: unknown,
): unknown => {
  if (typeof originalValue === "string" && originalValue.trim() === "") {
    return undefined;
  }

  return value;
};

const stringToBoolean = (
  value: unknown,
  originalValue: unknown,
): unknown => {
  if (typeof originalValue === "string") {
    const normalized = originalValue.trim().toLowerCase();

    if (normalized === "true") return true;
    if (normalized === "false") return false;
    if (normalized === "") return undefined;
  }

  return value;
};

const getAllCategoriesQuerySchema = yup.object({
  // TODO
});

const createCategorySchema = yup.object({
  name: yup
    .string()
    .transform(emptyStringToUndefined)
    .required("Category name is required")
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters"),
  slug: yup
    .string()
    .transform(emptyStringToUndefined)
    .required("Category slug is required")
    .trim()
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase letters, numbers, and hyphens)",
    ),
  description: yup
    .string()
    .transform(emptyStringToUndefined)
    .optional()
    .trim()
    .max(500, "Description must be at most 500 characters"),
  parent: yup
    .string()
    .transform(emptyStringToUndefined)
    .optional()
    .test(
      "parent-is-valid-objectid",
      "Parent category ID must be a valid MongoDB ObjectId",
      (value) => !value || isValidObjectId(value),
    ),
  isActive: yup
    .boolean()
    .transform(stringToBoolean)
    .optional()
    .default(true),
  order: yup
    .number()
    .transform((value, originalValue) => {
      if (
        typeof originalValue === "string" &&
        originalValue.trim() === ""
      ) {
        return undefined;
      }

      if (typeof originalValue === "string") {
        const parsed = Number(originalValue);
        return Number.isNaN(parsed) ? originalValue : parsed;
      }

      return value;
    })
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
