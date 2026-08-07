/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductModel, { IProductDocument } from "./product.model";
import { CreateProductDto } from "./dto/createProduct.dto";
import { GetAllProductsDto } from "./dto/getAllProducts.dto";
import { PopulateOptions, Types } from "mongoose";

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

  async find(input: GetAllProductsDto) {
    const {
      page = 1,
      limit = 20,
      sort = "newest",
      search,
      type,
      category,
      minStock,
      maxStock,
      minWeight,
      maxWeight,
      inStockOnly,
      includeInactive,
      isActive,
    } = input;

    const matchQuery: any = {};

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type) matchQuery.type = type;

    if (category && Types.ObjectId.isValid(category)) {
      matchQuery.category = new Types.ObjectId(category);
    }

    if (inStockOnly) {
      matchQuery.stock = { $gt: 0 };
    } else if (minStock !== undefined || maxStock !== undefined) {
      matchQuery.stock = {
        ...(minStock !== undefined && { $gte: minStock }),
        ...(maxStock !== undefined && { $lte: maxStock }),
      };
    }

    if (minWeight !== undefined || maxWeight !== undefined) {
      matchQuery.weight = {
        ...(minWeight !== undefined && { $gte: minWeight }),
        ...(maxWeight !== undefined && { $lte: maxWeight }),
      };
    }

    // By default only active products are returned
    if (isActive !== undefined) {
      matchQuery.isActive = isActive === "true";
    } else if (includeInactive !== "true") {
      matchQuery.isActive = true;
    }

    const sortQuery = this.getSortQuery(sort);
    const skip = (page - 1) * limit;

    const pipeline: any = [
      { $match: matchQuery },
      {
        $addFields: {
          inStock: { $gt: ["$stock", 0] },
          isOutOfStock: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
        },
      },

      { $sort: { isOutOfStock: 1 as const, ...sortQuery } },

      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: Number(limit) }],
        },
      },
    ];

    const [result] = await ProductModel.aggregate(pipeline);

    const totalCount = result.metadata[0]?.total || 0;
    const products = result.data;

    return {
      products,
      totalCount,
    };
  }
}
