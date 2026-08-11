import * as yup from "yup";
import { isValidObjectId } from "mongoose";

export const JEWELRY_FIELDS = [
  "weight",
  "wage",
  "wageType",
  "profitMargin",
  "taxRate",
];
export const COIN_FIELDS = ["coinType", "coinProfit", "coinProfitType"];

const getAllProductsQuerySchema = yup.object({
  search: yup.string().optional().trim(),
  type: yup
    .string()
    .oneOf(["JEWELRY", "COIN"], "Type must be either JEWELRY or COIN")
    .optional(),
  category: yup.string().optional().trim(),
  minStock: yup
    .number()
    .integer("minStock must be an integer")
    .min(0, "minStock cannot be negative")
    .optional(),
  maxStock: yup
    .number()
    .integer("maxStock must be an integer")
    .min(0, "maxStock cannot be negative")
    .optional(),
  minWeight: yup
    .number()
    .positive("minWeight must be a positive number")
    .optional(),
  maxWeight: yup
    .number()
    .positive("maxWeight must be a positive number")
    .optional(),
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
  sort: yup
    .string()
    .oneOf(
      ["newest", "oldest", "min_weight", "max_weight", "min_wage", "max_wage"],
      "Invalid sort option | Must be one of: newest, oldest, min_weight, max_weight, min_wage, max_wage",
    ),

  inStockOnly: yup.boolean().optional(),
  includeInactive: yup.boolean().optional(),
  isActive: yup.boolean().optional(),
});

const createProductSchema = yup.object({
  name: yup.string().trim().required("Name is required"),

  slug: yup
    .string()
    .required("Slug is required")
    .trim()
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase letters, numbers, and hyphens)",
    ),

  description: yup.string().nullable().optional(),

  type: yup
    .string()
    .oneOf(["JEWELRY", "COIN"], "Type must be either JEWELRY or COIN")
    .required("Type is required"),

  stock: yup
    .number()
    .typeError("Stock must be a number")
    .integer("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),

  category: yup
    .string()
    .required("Category is required")
    .test(
      "is-valid-object-id",
      "Category must be a valid ObjectId",
      (value) => {
        if (!value) return false;
        return isValidObjectId(value);
      },
    ),

  weight: yup
    .number()
    .typeError("Weight must be a number")
    .positive("Weight must be a positive number")
    .test(
      "weight-validation",
      "Weight is required for jewelry and forbidden for coins",
      function (value) {
        if (this.parent.type === "JEWELRY")
          return value !== undefined && value !== null;
        if (this.parent.type === "COIN")
          return value === undefined || value === null;
        return true;
      },
    ),

  wage: yup
    .number()
    .typeError("Wage must be a number")
    .min(0, "Wage cannot be negative")
    .test(
      "wage-validation",
      "Wage is required for jewelry and forbidden for coins",
      function (value) {
        if (this.parent.type === "JEWELRY")
          return value !== undefined && value !== null;
        if (this.parent.type === "COIN")
          return value === undefined || value === null;
        return true;
      },
    ),

  wageType: yup
    .string()
    .oneOf(["PERCENT", "FIXED"], "Wage type must be PERCENT or FIXED")
    .test(
      "wageType-validation",
      "Wage type is required for jewelry and forbidden for coins",
      function (value) {
        if (this.parent.type === "JEWELRY")
          return value !== undefined && value !== null;
        if (this.parent.type === "COIN")
          return value === undefined || value === null;
        return true;
      },
    ),

  profitMargin: yup
    .number()
    .typeError("Profit margin must be a number")
    .min(0, "Profit margin cannot be negative")
    .test(
      "profitMargin-validation",
      "Profit margin is required for jewelry and forbidden for coins",
      function (value) {
        if (this.parent.type === "JEWELRY")
          return value !== undefined && value !== null;
        if (this.parent.type === "COIN")
          return value === undefined || value === null;
        return true;
      },
    ),

  taxRate: yup
    .number()
    .typeError("Tax rate must be a number")
    .min(0, "Tax rate cannot be negative")
    .test(
      "taxRate-validation",
      "Tax rate is required for jewelry and forbidden for coins",
      function (value) {
        if (this.parent.type === "JEWELRY")
          return value !== undefined && value !== null;
        if (this.parent.type === "COIN")
          return value === undefined || value === null;
        return true;
      },
    ),

  coinType: yup
    .string()
    .oneOf(
      ["EMAMI", "BAHAR_AZADI", "HALF", "QUARTER", "GRAM"],
      "Invalid coin type",
    )
    .test(
      "coinType-validation",
      "Coin type is required for coins and forbidden for jewelry",
      function (value) {
        if (this.parent.type === "COIN")
          return value !== undefined && value !== null;
        if (this.parent.type === "JEWELRY")
          return value === undefined || value === null;
        return true;
      },
    ),

  coinProfit: yup
    .number()
    .typeError("Coin profit must be a number")
    .min(0, "Coin profit cannot be negative")
    .test(
      "coinProfit-validation",
      "Coin profit is required for coins and forbidden for jewelry",
      function (value) {
        if (this.parent.type === "COIN")
          return value !== undefined && value !== null;
        if (this.parent.type === "JEWELRY")
          return value === undefined || value === null;
        return true;
      },
    ),

  coinProfitType: yup
    .string()
    .oneOf(["PERCENT", "FIXED"], "Coin profit type must be PERCENT or FIXED")
    .test(
      "coinProfitType-validation",
      "Coin profit type is required for coins and forbidden for jewelry",
      function (value) {
        if (this.parent.type === "COIN")
          return value !== undefined && value !== null;
        if (this.parent.type === "JEWELRY")
          return value === undefined || value === null;
        return true;
      },
    ),

  isActive: yup.boolean().optional(),
  customFilters: yup.object().optional(),
});

const updateProductSchema = yup
  .object({
    name: yup.string().trim().optional(),

    slug: yup
      .string()
      .trim()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly")
      .optional(),

    description: yup.string().nullable().optional(),

    type: yup
      .mixed()
      .test(
        "no-type-update",
        "Updating product type is not allowed.",
        (value) => value === undefined,
      ),

    stock: yup
      .number()
      .typeError("Stock must be a number")
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .optional(),

    category: yup
      .string()
      .test(
        "is-valid-object-id",
        "Category must be a valid ObjectId",
        (value) => {
          if (!value) return true;
          return isValidObjectId(value);
        },
      )
      .optional(),

    weight: yup
      .number()
      .typeError("Weight must be a number")
      .positive()
      .optional(),

    wage: yup.number().typeError("Wage must be a number").min(0).optional(),

    wageType: yup
      .string()
      .oneOf(["PERCENT", "FIXED"], "Wage type must be PERCENT or FIXED")
      .optional(),

    profitMargin: yup
      .number()
      .typeError("Profit margin must be a number")
      .min(0)
      .optional(),

    taxRate: yup
      .number()
      .typeError("Tax rate must be a number")
      .min(0)
      .optional(),

    coinType: yup
      .string()
      .oneOf(
        ["EMAMI", "BAHAR_AZADI", "HALF", "QUARTER", "GRAM"],
        "Invalid coin type",
      )
      .optional(),

    coinProfit: yup
      .number()
      .typeError("Coin profit must be a number")
      .min(0)
      .optional(),

    coinProfitType: yup
      .string()
      .oneOf(["PERCENT", "FIXED"], "Coin profit type must be PERCENT or FIXED")
      .optional(),

    isActive: yup.boolean().optional(),

    customFilters: yup.object().optional(),
  })
  .test(
    "not-empty",
    "Request body cannot be empty. Please provide at least one field to update.",
    (bodyObject) => {
      if (!bodyObject) return false;
      return Object.keys(bodyObject).length > 0;
    },
  )
  .test(
    "mutually-exclusive-fields",
    "Field conflict: Cannot send jewelry and coin fields in the same request.",
    function (bodyObject) {
      if (!bodyObject) return true;

      const hasJewelryField = JEWELRY_FIELDS.some(
        (field) => (bodyObject as Record<string, unknown>)[field] !== undefined,
      );
      const hasCoinField = COIN_FIELDS.some(
        (field) => (bodyObject as Record<string, unknown>)[field] !== undefined,
      );

      if (hasJewelryField && hasCoinField) {
        return false;
      }
      return true;
    },
  );

const deleteProductSchema = yup.object({
  confirmationPhrase: yup
    .string()
    .required("Confirmation phrase is required")
    .matches(
      /^DELETE PRODUCT [a-zA-Z0-9_-]+$/i,
      "Confirmation phrase must start with 'DELETE PRODUCT ' followed by the target ProductId",
    ),
});

const ProductImagesSchema = yup.object({
  // TODO
});

export {
  getAllProductsQuerySchema,
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
  ProductImagesSchema,
};
