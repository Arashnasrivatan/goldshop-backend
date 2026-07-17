import slugify from "slugify";
import { Types } from "mongoose";

import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/createCategory.dto";

import { AppError } from "../../common/errors/AppError";
import configs from "../../configs/env.config";
import ImageProcessor from "../../common/services/image.processor";
import { createPaginationData } from "../../common/utils";
import { IPaginationData } from "../../common/types/utils";

import S3StorageService, {
  type UploadedFile,
} from "../../common/services/S3StorageService";
import { GetAllCategoriesDto } from "./dto/getAllCategories.dto";

export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly storageService: S3StorageService,
  ) {}

  private readonly categoryMaxDepth = configs.other.categoryMaxDepth || 2;

  async createCategory(input: CreateCategoryDto, image?: UploadedFile) {
    const slug = slugify(input.slug, {
      lower: true,
      strict: true,
      trim: true,
      replacement: "-",
    });

    const name = input.name.trim();

    const [existingSlug, existingName] = await Promise.all([
      this.categoryRepository.findBySlug(slug),
      this.categoryRepository.findByName(name),
    ]);

    if (existingSlug) {
      throw new AppError("Category slug already exists", 409);
    }

    if (existingName) {
      throw new AppError("Category name already exists", 409);
    }

    let level = 0;
    let path: string[] = [];

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
        ...(parentCategory.path ?? []).map((id: Types.ObjectId) =>
          id.toString(),
        ),
        parentCategory._id.toString(),
      ];
    }

    let categoryImage:
      | {
          url: string;
          key: string;
        }
      | undefined;

    if (image) {
      if (
        !image.mimetype ||
        !ImageProcessor.isSupportedImageMimeType(image.mimetype)
      ) {
        throw new AppError(
          "Unsupported image format. Allowed: JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF, HEIF",
          400,
        );
      }

      const uploaded = await this.storageService.upload(image, {
        folder: "categories",
        visibility: "public",
      });

      categoryImage = {
        url: uploaded.url,
        key: uploaded.key,
      };
    }

    const category = await this.categoryRepository.create({
      ...input,
      name,
      slug,
      level,
      path,
      image: categoryImage,
    });

    return {
      message: "Category created Successfully :)",
      data: category,
    };
  }

  async getAllCategories(input: GetAllCategoriesDto) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const sort = input.sort ?? "asc";

    const { data: categories, meta } = await this.categoryRepository.findAll(
      {
        search: input.search,
        catId: input.catId,
        slug: input.slug,
        parent: input.parent,
        level: input.level,
        isActive: input.isActive,
      },
      limit,
      page,
      sort,
    );

    const paginationData: IPaginationData = createPaginationData(
      meta.page,
      meta.limit,
      meta.total,
      "Categories",
    );

    return {
      message: "Categories fetched Successfully :)",
      data: {
        paginationData,
        categories,
      },
    };
  }

}
