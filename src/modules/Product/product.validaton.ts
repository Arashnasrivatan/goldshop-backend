import * as yup from "yup";
import { isValidObjectId } from "mongoose";

const getAllProductsQuerySchema = yup.object({
  // TODO
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

const updateProductSchema = yup.object({
  // TODO
});

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
