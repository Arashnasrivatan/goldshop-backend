import ProductModel, { IProductDocument } from "./product.model";
import { CreateProductDto } from "./dto/createProduct.dto";

export class ProductRepository {
  async findById(ProductId: string): Promise<IProductDocument | null> {
    return await ProductModel.findOne({ _id: ProductId });
  }

  async findBySlug(slug: string): Promise<IProductDocument | null> {
    return await ProductModel.findOne({ slug });
  }

  async create(input: CreateProductDto): Promise<IProductDocument> {
    const product = await ProductModel.create(input);

    return product;
  }
}
