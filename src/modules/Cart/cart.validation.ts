import { isValidObjectId } from "mongoose";
import * as yup from "yup";

const addCartItemSchema = yup
  .object({
    productId: yup.string().trim().required("Product ID is required"),
  })
  .test("isValidObjectId", "productId is invalid", (value) => {
    return value === undefined || isValidObjectId(value.productId);
  })
  .noUnknown();

const updateCartItemSchema = yup
  .object({
    quantity: yup
      .number()
      .typeError("Quantity must be a number")
      .integer("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .required("Quantity is required"),
  })
  .noUnknown();

export { addCartItemSchema, updateCartItemSchema };
