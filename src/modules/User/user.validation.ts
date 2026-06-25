import * as yup from "yup";

import { UserRole } from "./user.model";
import { isValidObjectId } from "mongoose";

const getAllUsersParamsSchema = yup.object().shape({
  search: yup.string().optional().trim(),
  userId: yup
    .string()
    .optional()
    .trim()
    .test("isValidObjectId", "userId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
  phone: yup
    .string()
    .optional()
    .trim()
    .matches(/^09\d*$/, "Phone must start with 09")
    .max(11, "Phone number must be at most 11 digits long"),

  from: yup
    .string()
    .optional()
    .test("is-valid-date", "'from' Date format is invalid", (value) => {
      if (!value) return true;
      return !isNaN(new Date(value).getTime());
    }),
  to: yup
    .string()
    .optional()
    .test("is-valid-date", "'to' Date format is invalid", (value) => {
      if (!value) return true;
      return !isNaN(new Date(value).getTime());
    })
    .test(
      "end-date-after-start-date",
      "The ‘to’ date must be after the ‘from’ date.",
      function (value) {
        const { from } = this.parent;
        if (value && from) {
          return new Date(value) >= new Date(from);
        }
        return true;
      },
    ),

  role: yup
    .string()
    .optional()
    .oneOf(Object.values(UserRole), "Invalid role value"),

  includeBanned: yup.boolean().optional(),
  sort: yup
    .string()
    .optional()
    .oneOf(["asc", "desc"], "Sort value must be asc or desc"),
  limit: yup
    .number()
    .optional()
    .integer("Limit must be a positive integer")
    .positive("Limit must be a positive integer")
    .max(100, "Maximum allowed limit is 100"),
  page: yup
    .number()
    .optional()
    .integer("Page must be a positive integer")
    .positive("Page must be a positive integer"),
});

const updateUserSchema = yup
  .object()
  .shape({
    fullname: yup.string().optional().trim(),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    (value) => {
      return !!value.fullname;
    },
  );

const adminUserDeleteSchema = yup.object().shape({
  confirmationPhrase: yup
    .string()
    .required("Confirmation phrase is required")
    .matches(
      /^DELETE USER [a-zA-Z0-9_-]+$/i,
      "Confirmation phrase must start with 'DELETE USER ' followed by the targer userId",
    ),
});

const adminAddUserAddressSchema = yup.object().shape({
  // TODO
});

const adminUpdateUserAddressSchema = yup.object().shape({
  // TODO
});

const adminDeleteUserAddressSchema = yup.object().shape({
  // TODO
});

//* ==================== *\\

const updateMeSchema = yup.object().shape({
  // TODO
});

const deleteMeSchema = yup.object().shape({
  // TODO
});

const changePasswordSchema = yup.object().shape({
  // TODO
});

const updateAddressSchema = yup.object().shape({
  // TODO
});

const addAddressSchema = yup.object().shape({
  // TODO
});

const deleteAddressSchema = yup.object().shape({
  // TODO
});

const addressIdParamsSchema = yup.object().shape({
  addressId: yup
    .string()
    .required("addressId is required")
    .test("isValidObjectId", "AddressId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
});

export {
  getAllUsersParamsSchema,
  updateUserSchema,
  adminUserDeleteSchema,
  adminAddUserAddressSchema,
  adminUpdateUserAddressSchema,
  adminDeleteUserAddressSchema,
  updateMeSchema,
  deleteMeSchema,
  changePasswordSchema,
  updateAddressSchema,
  addAddressSchema,
  deleteAddressSchema,
  addressIdParamsSchema,
};
