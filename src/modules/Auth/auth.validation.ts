import * as yup from "yup";

const sentSchema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^09[0-9]{9}$/,
      "Phone number must start with 09 and be 11 digits long",
    ),
});

const verifySchema = yup.object().shape({
  // TODO
});

const loginSchema = yup.object().shape({
  // TODO
});

const forgotPasswordSchema = yup.object().shape({
  // TODO
});

const resetPasswordSchema = yup.object().shape({
  // TODO
});

const resetPasswordParamsSchema = yup.object().shape({
  // TODO
});

export {
  sentSchema,
  verifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordParamsSchema,
};
