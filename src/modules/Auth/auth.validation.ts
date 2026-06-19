import * as yup from "yup";
import { validate as uuidValidate } from "uuid";

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
  fullname: yup.string().required("fullname is required").min(3).max(50),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^09[0-9]{9}$/,
      "Phone number must start with 09 and be 11 digits long",
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(24, "Password must be less than 24 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  otp: yup
    .string()
    .required("OTP code is required")
    .length(4, "OTP code must be exactly 4 characters long"),
});

const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^09[0-9]{9}$/,
      "Phone number must start with 09 and be 11 digits long",
    ),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%*_?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});

const forgotPasswordSchema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^09[0-9]{9}$/,
      "Phone number must start with 09 and be 11 digits long",
    ),
});

const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required("Please enter new password")
    .min(8, "Password cannot be less than 8 characters")
    .max(24, "Password cannot be more than 24 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("newPassword"), undefined],
      "Confirm password does not match the new password",
    )
    .required("Please confirm new password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});

const resetPasswordParamsSchema = yup.object().shape({
  token: yup
    .string()
    .required("reset Token is Required")
    .test("is-valid-uuid", "reset Token is invalid", (value) => {
      return value === undefined || uuidValidate(value);
    }),
});

export {
  sentSchema,
  verifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordParamsSchema,
};
