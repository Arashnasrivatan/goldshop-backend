import * as yup from "yup";

export const getDashboardSchema = yup
  .object({
    period: yup
      .string()
      .oneOf(["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR", "ALL_TIME"])
      .default("THIS_MONTH"),
  })
  .noUnknown();
