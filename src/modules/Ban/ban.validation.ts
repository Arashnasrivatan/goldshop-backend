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
  // TODO
});

export { banUserSchema, getAllBansParamsSchema };
