/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductModel, { IProductDocument } from "./product.model";
import { CreateProductDto } from "./dto/createProduct.dto";
import { GetAllProductsDto } from "./dto/getAllProducts.dto";
import { PipelineStage, PopulateOptions, Types } from "mongoose";

export class ProductRepository {
  private getSortQuery(sortOption?: string): Record<string, 1 | -1> {
    switch (sortOption) {
      case "oldest":
        return { createdAt: 1 };
      case "min_weight":
        return { weight: 1 };
      case "max_weight":
        return { weight: -1 };
      case "min_wage":
        return { wage: 1 };
      case "max_wage":
        return { wage: -1 };
      case "newest":
      default:
        return { createdAt: -1 };
    }
  }

  //* ========================== *\\

  async findById(
    ProductId: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
  ): Promise<IProductDocument | null> {
    let query = ProductModel.findById(ProductId);

    if (populate) {
      query = query.populate(populate as any);
    }

    return await query.exec();
  }

  async findBySlug(
    slug: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
  ): Promise<IProductDocument | null> {
    let query = ProductModel.findOne({ slug });

    if (populate) {
      query = query.populate(populate as any);
    }

    return await query.exec();
  }

  async create(input: CreateProductDto): Promise<IProductDocument> {
    const product = await ProductModel.create(input);

    return product;
  }

  async find(input: GetAllProductsDto & { categoryIds?: Types.ObjectId[] }) {
    const {
      page = 1,
      limit = 20,
      sort = "newest",
      search,
      type,
      categoryIds,
      minStock,
      maxStock,
      minWeight,
      maxWeight,
      inStockOnly,
      includeInactive,
      includeDeleted,
      isActive,
      isDeleted,
    } = input;

    const matchQuery: Record<string, any> = {};

    //* 1. Search Query
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    //* 2. Exact Matches
    if (type) matchQuery.type = type;

    if (categoryIds?.length) {
      matchQuery.category = { $in: categoryIds };
    }

    //* 3. Stock Logic
    const isInStockOnly = inStockOnly === "true";
    if (isInStockOnly) {
      matchQuery.stock = { $gt: 0 };
    } else if (minStock !== undefined || maxStock !== undefined) {
      matchQuery.stock = {
        ...(minStock !== undefined && { $gte: Number(minStock) }),
        ...(maxStock !== undefined && { $lte: Number(maxStock) }),
      };
    }

    //* 4. Weight Logic
    if (minWeight !== undefined || maxWeight !== undefined) {
      matchQuery.weight = {
        ...(minWeight !== undefined && { $gte: Number(minWeight) }),
        ...(maxWeight !== undefined && { $lte: Number(maxWeight) }),
      };
    }
    //* 5 & 6. Status & Trash Logic (Combined)
    const reqIsDeleted = isDeleted === "true";
    const reqIncludeDeleted = includeDeleted === "true";

    if (reqIsDeleted) {
      matchQuery.isDeleted = true;
    } else {
      if (!reqIncludeDeleted) {
        matchQuery.isDeleted = { $ne: true };
      }

      if (isActive !== undefined) {
        matchQuery.isActive = isActive === "true";
      } else if (includeInactive !== "true" && !reqIncludeDeleted) {
        matchQuery.isActive = true;
      }
    }

    //* 7. Pagination & Sorting setup
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 20;
    const skip = (parsedPage - 1) * parsedLimit;
    const sortQuery = this.getSortQuery(sort);

    //* 8. Aggregation Pipeline
    const pipeline: PipelineStage[] = [
      { $match: matchQuery },
      {
        $addFields: {
          inStock: { $gt: ["$stock", 0] },
          isOutOfStock: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
        },
      },
      {
        $sort: { isOutOfStock: 1, ...sortQuery },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: parsedLimit }],
        },
      },
    ];

    //* 9. Execute Query
    const [result] = await ProductModel.aggregate(pipeline);

    const totalCount = result?.metadata?.[0]?.total || 0;
    const products = result?.data || [];

    return {
      products,
      totalCount,
    };
  }

  async update(productId: string, updateData: any) {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    return updatedProduct;
  }

  async addImages(
    productId: string,
    images: Array<{ url: string; key: string }>,
  ) {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $push: { images: { $each: images } } },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    return updatedProduct;
  }

  async deleteImages(productId: string, keys: string[]) {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $pull: { images: { key: { $in: keys } } } },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    return updatedProduct;
  }

  async delete(productId: string) {
    return await ProductModel.findByIdAndDelete(productId);
  }

  async getImagesOnly(productId: string) {
    return await ProductModel.findById(productId).select("images").lean();
  }
}
