import * as yup from "yup";

export const updateCheckoutStatusSchema = yup.object({
  orderRegistrationEnabled: yup.boolean().strict().required("Order registration status is required"),
}).noUnknown();
