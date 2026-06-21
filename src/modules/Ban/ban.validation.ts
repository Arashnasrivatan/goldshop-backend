import { isValidObjectId } from "mongoose";
import * as yup from "yup";

const banUserSchema = yup.object().shape({
  userId: yup
    .string()
    .required("userId is required")
    .test("isValidObjectId", "userId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
  banReason: yup.string().required("ban Reason is required").min(5).max(100),
});

const getAllBansParamsSchema = yup.object().shape({
  search: yup.string().optional().trim(),
  phone: yup
    .string()
    .optional()
    .trim()
    .matches(/^09\d*$/, "Phone must start with 09")
    .max(11, "Phone number must be at most 11 digits long"),
  userId: yup
    .string()
    .optional()
    .trim()
    .test("isValidObjectId", "userId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
  bannedBy: yup.string().optional().trim(),
  banReason: yup.string().optional().trim(),

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

const editBanSchema = yup.object().shape({
  banReason: yup.string().required("ban Reason is required").min(5).max(100),
});

const banIdParamsSchema = yup.object().shape({
  banId: yup
    .string()
    .required("banId is required")
    .test("isValidObjectId", "banId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
});

export {
  banUserSchema,
  getAllBansParamsSchema,
  editBanSchema,
  banIdParamsSchema,
};
