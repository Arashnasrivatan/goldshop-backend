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

export { userIdParamsSchema };
