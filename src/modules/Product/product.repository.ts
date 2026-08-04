import ProductModel, { IProductDocument } from "./product.model";
import { AppError } from "../../common/errors/AppError";

export class ProductRepository {
  async findById(ProductId: string): Promise<IProductDocument | null> {
    return await ProductModel.findOne({ _id: ProductId });
  }

  async findBySlug(slug: string): Promise<IProductDocument | null> {
    return await ProductModel.findOne({ slug });
  }
}
