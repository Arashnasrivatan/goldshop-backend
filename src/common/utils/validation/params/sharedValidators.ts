import { isValidObjectId } from "mongoose";
import * as yup from "yup";

const userIdParamsSchema = yup.object().shape({
  userId: yup
    .string()
    .required("userId is required")
    .test("isValidObjectId", "userId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
});

const categoryIdParamsSchema = yup.object().shape({
  categoryId: yup
    .string()
    .required("categoryId is required")
    .test("isValidObjectId", "categoryId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
});

export { userIdParamsSchema, categoryIdParamsSchema };
