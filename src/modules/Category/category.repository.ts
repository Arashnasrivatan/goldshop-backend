import CategoryModel, { ICategoryDocument } from "./category.model";
import { Types } from "mongoose";
import { CreateCategoryDto } from "./dto/createCategory.dto";
import { ICategoryFilter } from "./category.types";
import { AppError } from "../../common/errors/AppError";

export class CategoryRepository {
  async findById(categoryId: string): Promise<ICategoryDocument | null> {
    return await CategoryModel.findOne({ _id: categoryId });
  }

  async findBySlug(slug: string): Promise<ICategoryDocument | null> {
    return await CategoryModel.findOne({ slug });
  }

  async findByName(name: string): Promise<ICategoryDocument | null> {
    return await CategoryModel.findOne({ name });
  }

  async findAll(
    filter: ICategoryFilter = {},
    limit: number = 10,
    page: number = 1,
    sort: string = "asc",
  ) {
    const sortOrder = sort === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (filter.search) {
      query.$or = [
        { name: new RegExp(filter.search, "i") },
        { slug: new RegExp(filter.search, "i") },
        { description: new RegExp(filter.search, "i") },
      ];
    }

    if (filter.catId) {
      query._id = filter.catId;
    }

    if (filter.slug) {
      query.slug = filter.slug;
    }

    if (filter.parent) {
      query.parent = filter.parent;
    }

    if (filter.level !== undefined) {
      query.level = Number(filter.level);
    }

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive === "true";
    }

    const [data, total] = await Promise.all([
      CategoryModel.find(query)
        .select("-__v")
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean<ICategoryDocument[]>(),

      CategoryModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findAllForTree(): Promise<ICategoryDocument[]> {
    return await CategoryModel.find({ isActive: true })
      .select("-__v")
      .sort({ order: 1, createdAt: 1 })
      .lean<ICategoryDocument[]>();
  }

  async create(input: CreateCategoryDto): Promise<ICategoryDocument> {
    const {
      name,
      slug,
      description,
      parent,
      path,
      level,
      order,
      isActive,
      image,
    } = input;

    const category = await CategoryModel.create({
      name,
      slug,
      description,
      parent: parent ? new Types.ObjectId(parent) : undefined,
      path: path?.map((id) => new Types.ObjectId(id)) ?? [],
      level,
      order,
      isActive,
      ...(image ? { image } : {}),
    });

    return category;
  }

  async update(
    categoryId: string,
    updateData: Partial<ICategoryDocument>,
  ): Promise<ICategoryDocument> {
    const category = await CategoryModel.findByIdAndUpdate(
      categoryId,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  }

  async findChildren(parentId: Types.ObjectId): Promise<ICategoryDocument[]> {
    return CategoryModel.find({
      parent: parentId,
    });
  }

  async updateMany(
    updates: Array<{
      id: Types.ObjectId;
      data: Partial<ICategoryDocument>;
    }>,
  ): Promise<void> {
    if (!updates.length) {
      return;
    }

    const operations = updates.map((item) => ({
      updateOne: {
        filter: {
          _id: item.id,
        },

        update: {
          $set: item.data,
        },
      },
    }));

    await CategoryModel.bulkWrite(operations);
  }

  async findDescendants(
    categoryId: Types.ObjectId,
  ): Promise<ICategoryDocument[]> {
    return CategoryModel.find({
      path: categoryId,
    });
  }
}
