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

const updateShippingSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(3, "Shipping method name must be at least 3 characters")
      .max(20, "Shipping method name cannot exceed 20 characters")
      .optional(),

    description: yup.string().trim().min(5).max(100).nullable().optional(),
    price: yup
      .number()
      .typeError("Shipping price must be a number")
      .min(0, "Shipping price cannot be negative")
      .optional(),
    isActive: yup.boolean().optional(),
    sortOrder: yup
      .number()
      .typeError("sortOrder must be a number")
      .min(0, "Sort order cannot be negative")
      .optional(),
  })
  .test(
    "not-empty",
    "At least one field must be provided for update",
    function (bodyObject) {
      const hasBody = !!bodyObject && Object.keys(bodyObject).length > 0;

      const hasFile = Boolean(this.options.context?.file);

      const hasFiles = Boolean(this.options.context?.files);

      return hasBody || hasFile || hasFiles;
    },
  );

const getAllShippingQuerySchema = yup.object({
  search: yup.string().optional().trim(),
  isActive: yup.boolean().optional(),
});
export {
  createShippingSchema,
  updateShippingSchema,
  getAllShippingQuerySchema,
};
