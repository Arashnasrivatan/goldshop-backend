import * as yup from "yup";

const getPriceHistoryQuerySchema = yup.object({
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

export { getPriceHistoryQuerySchema };
