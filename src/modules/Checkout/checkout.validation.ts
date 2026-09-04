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
      .optional()
      .test(
        "is-valid-object-id",
        "Address ID is invalid",
        (value) => !value || isValidObjectId(value),
      ),
  })
  .noUnknown();

const verifyCheckoutSchema = yup
  .object({
    trackId: yup
      .string()
      .trim()
      .required("Track ID is required")
      .matches(/^[a-zA-Z0-9_-]+$/, "Track ID has an invalid format"),
  })
  .noUnknown();

export { createCheckoutSchema, verifyCheckoutSchema };
