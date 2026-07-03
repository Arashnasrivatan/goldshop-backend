import * as yup from "yup";
import { isValidObjectId } from "mongoose";

const getAllCategoriesQuerySchema = yup.object({
  // TODO
});

const createCategorySchema = yup
  .object({
    name: yup.string().required("Category name is required"),
    slug: yup
      .string()
      .required("Category slug is required")
      .matches(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be URL-friendly (lowercase letters, numbers, and hyphens)",
      ),
    description: yup.string().optional(),
    parent: yup
      .string()
      .optional()
      .matches(
        /^[0-9a-fA-F]{24}$/,
        "Parent category ID must be a valid MongoDB ObjectId",
      ),
    isActive: yup.boolean().optional(),
  })
  .test(
    "parent-is-valid-objectid",
    "Parent category ID must be a valid MongoDB ObjectId",
    (value) => {
      if (value.parent !== undefined) {
        if (isValidObjectId(value.parent)) {
          return true;
        }
        return false;
      }
      return true; // If parent is not provided, it's valid
    },
  );

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
