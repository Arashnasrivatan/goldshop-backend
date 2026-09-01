import * as yup from "yup";
import { isValidObjectId } from "mongoose";

const createCheckoutSchema = yup
  .object({
    shippingMethodId: yup
      .string()
      .required("Shipping Method ID is required")
      .test(
        "is-valid-object-id",
        "Shipping Method ID is invalid",
        (value) => Boolean(value) && isValidObjectId(value),
      ),

    addressId: yup
      .string()
      .required("Address ID is required")
      .test(
        "is-valid-object-id",
        "Address ID is invalid",
        (value) => Boolean(value) && isValidObjectId(value),
      ),
  })
  .noUnknown();

const verifyCheckoutSchema = yup
  .object({
    Authority: yup.string().trim().required("Authority is required"),

    Status: yup.string().trim().required("Status is required"),
  })
  .noUnknown();

export { createCheckoutSchema, verifyCheckoutSchema };
