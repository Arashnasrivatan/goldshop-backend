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
    // TODO
  })
  .noUnknown();

export { addCartItemSchema, updateCartItemSchema };
