import * as yup from "yup";

const getAllProductsQuerySchema = yup.object({
  // TODO
});

const createProductSchema = yup.object({
  // TODO
});

const updateProductSchema = yup.object({
  // TODO
});

const deleteProductSchema = yup.object({
  confirmationPhrase: yup
    .string()
    .required("Confirmation phrase is required")
    .matches(
      /^DELETE PRODUCT [a-zA-Z0-9_-]+$/i,
      "Confirmation phrase must start with 'DELETE PRODUCT ' followed by the target ProductId",
    ),
});

const ProductImagesSchema = yup.object({
  // TODO
});

export {
  getAllProductsQuerySchema,
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
  ProductImagesSchema,
};
