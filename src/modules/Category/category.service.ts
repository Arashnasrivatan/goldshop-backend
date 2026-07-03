import slugify from "slugify";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/createCategory.dto";
import { AppError } from "../../common/errors/AppError";
import { Types } from "mongoose";
import configs from "./../../configs/env.config";

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  categoryMaxDepth = configs.other.categoryMaxDepth || 2;

    //* ========== Category Management ========== *\\`

  async createCategory(input: CreateCategoryDto) {
    let level = 0;
    let path: string[] = [];
    const slug = slugify(input.slug, { lower: true, strict: true, trim: true, replacement: "-"});

    if (input.parent) {
      const parentCategory = await this.categoryRepository.findById(
        input.parent,
      );

      if (!parentCategory) {
        throw new AppError("Parent category not found", 404);
      }

      if (parentCategory.level >= this.categoryMaxDepth) {
        throw new AppError(
          `Maximum category depth of ${this.categoryMaxDepth} levels exceeded`,
          400,
        );
      }

      level = parentCategory.level + 1;
      path = [
        ...(parentCategory.path || []).map((id: Types.ObjectId | string) =>
          typeof id === "string" ? id : id.toString(),
        ),
        parentCategory._id.toString(),
      ];
    }

    const category = await this.categoryRepository.create({
      ...input,
      slug,
      level,
      path,
    });
    return { message: "Category created Successfully :)", data: category };
  }
}
