import * as yup from "yup";
import { isValidObjectId } from "mongoose";

const orderIdParamsSchema = yup.object({
  orderId: yup
    .string()
    .required("orderId is required")
    .test("is-valid-object-id", "orderId is invalid", (value) => {
      return value !== undefined && isValidObjectId(value);
    }),
});

const getAllOrdersQuerySchema = yup.object({
  search: yup.string().trim().optional(),
  userId: yup
    .string()
    .optional()
    .test("is-valid-object-id", "userId is invalid", (value) => {
      if (!value) return true;
      return isValidObjectId(value);
    }),
  status: yup
    .string()
    .oneOf(
      [
        "PENDING_PAYMENT",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "READY_FOR_PICKUP",
        "CANCELLED",
        "REFUNDED",
      ],
      "Invalid order status",
    )
    .optional(),
  paymentAuthority: yup.string().trim().optional(),
  postTrackingCode: yup.string().trim().optional(),
  from: yup.date().typeError("from must be a valid date").optional(),
  to: yup.date().typeError("to must be a valid date").optional(),
  includeDeleted: yup.boolean().optional(),
  limit: yup
    .number()
    .typeError("Limit must be a number")
    .integer("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Maximum allowed limit is 100")
    .optional(),
  page: yup
    .number()
    .typeError("Page must be a number")
    .integer("Page must be an integer")
    .min(1, "Page must be at least 1")
    .optional(),
  sort: yup
    .string()
    .oneOf(["asc", "desc"], "Sort must be either asc or desc")
    .optional(),
});

const updateOrderSchema = yup
  .object({
    status: yup
      .string()
      .oneOf(
        [
          "PENDING_PAYMENT",
          "PAID",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
          "REFUNDED",
        ],
        "Invalid order status",
      )
      .optional(),
    adminNote: yup
      .string()
      .trim()
      .max(500, "Admin note is too long")
      .nullable()
      .optional(),
    postTrackingCode: yup.string().trim().nullable().optional(),
    isDeleted: yup.boolean().optional(),
    payment: yup
      .object({
        authority: yup.string().trim().nullable().optional(),
        paidAt: yup.date().nullable().optional(),
      })
      .optional()
      .noUnknown("Only authority and paidAt are allowed in payment"),
  })
  .test(
    "not-empty",
    "At least one field must be provided for update",
    function (bodyObject) {
      return !!bodyObject && Object.keys(bodyObject).length > 0;
    },
  );

const deleteOrderSchema = yup.object({
  confirmationPhrase: yup
    .string()
    .required("Confirmation phrase is required")
    .matches(
      /^DELETE ORDER [a-zA-Z0-9_-]+$/i,
      "Confirmation phrase must start with 'DELETE ORDER ' followed by the target orderId",
    ),
});

export {
  orderIdParamsSchema,
  getAllOrdersQuerySchema,
  updateOrderSchema,
  deleteOrderSchema,
};
