import * as yup from "yup";

const createShippingSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, "Shipping method name must be at least 3 characters")
    .max(20, "Shipping method name cannot exceed 20 characters")
    .required("Shipping Method name is required"),

  description: yup.string().trim().min(5).max(100).nullable().optional(),
  price: yup
    .number()
    .typeError("Shipping price must be a number")
    .min(0, "Shipping price cannot be negative")
    .required("Shipping price is required"),
  isActive: yup.boolean().optional(),
  sortOrder: yup
    .number()
    .typeError("sortOrder must be a number")
    .min(0, "Sort order cannot be negative")
    .optional(),
});

const updateShippingSchema = yup.object({
  // TODO
});

const getAllShippingQuerySchema = yup.object({
  search: yup.string().optional().trim(),
});

const getAllShippingAdminQuerySchema = yup.object({
  // TODO
});
export {
  createShippingSchema,
  updateShippingSchema,
  getAllShippingQuerySchema,
  getAllShippingAdminQuerySchema,
};
