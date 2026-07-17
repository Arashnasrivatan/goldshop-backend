import CategoryModel, { ICategoryDocument } from "./category.model";
import { Types } from "mongoose";
import { CreateCategoryDto } from "./dto/createCategory.dto";

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
}
