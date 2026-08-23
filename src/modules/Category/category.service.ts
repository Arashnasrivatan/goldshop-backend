import slugify from "slugify";
import { Types } from "mongoose";

import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/createCategory.dto";
import { ICategoryDocument } from "./category.model";
import { ICategoryTreeNode } from "./category.types";

import { AppError } from "../../common/errors/AppError";
import configs from "../../configs/env.config";
import ImageProcessor from "../../common/services/image.processor";
import { createPaginationData } from "../../common/utils";
import { IPaginationData } from "../../common/types/utils";

import S3StorageService, {
  type UploadedFile,
} from "../../common/services/S3StorageService";
import { GetAllCategoriesDto } from "./dto/getAllCategories.dto";
import { GetCategoryBySlugDto } from "./dto/getCategoryBySlug.dto";
import { GetCategoryByIdDto } from "./dto/getCategoryById.dto";
import { UpdateCategoryDto } from "./dto/updateCategory.dto";
import { DeleteCategoryDto } from "./dto/deleteCategory.dto";

export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly storageService: S3StorageService,
  ) {}

  private readonly categoryMaxDepth = configs.other.categoryMaxDepth || 2;

  private buildCategoryTree(
    categories: ICategoryDocument[],
  ): ICategoryTreeNode[] {
    const categoryMap = new Map<string, ICategoryTreeNode>();

    categories.forEach((category) => {
      const id = category._id.toString();

      categoryMap.set(id, {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? null,
        parent: category.parent ?? null,
        path: category.path ?? [],
        image: category.image ?? null,
        level: category.level,
        isActive: category.isActive,
        order: category.order,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        children: [],
      });
    });

    const roots: ICategoryTreeNode[] = [];

    categories.forEach((category) => {
      const id = category._id.toString();

      const node = categoryMap.get(id);

      if (!node) return;

      const parentId = category.parent?.toString();

      if (!parentId) {
        roots.push(node);
        return;
      }

      const parentNode = categoryMap.get(parentId);

      if (parentNode) {
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortRecursive = (nodes: ICategoryTreeNode[]) => {
      nodes.sort((a, b) => {
        const orderDiff = a.order - b.order;

        if (orderDiff !== 0) {
          return orderDiff;
        }

        const aDate = a.createdAt?.getTime() ?? 0;
        const bDate = b.createdAt?.getTime() ?? 0;

        return aDate - bDate;
      });

      nodes.forEach((node) => {
        if (node.children.length > 0) {
          sortRecursive(node.children);
        }
      });
    };

    sortRecursive(roots);

    return roots;
  }

  private async updateChildrenTree(category: ICategoryDocument): Promise<void> {
    const children = await this.categoryRepository.findChildren(category._id);

    if (!children.length) {
      return;
    }

    const updates: Array<{
      id: Types.ObjectId;
      data: Partial<ICategoryDocument>;
    }> = [];

    for (const child of children) {
      const newLevel = category.level + 1;

      const newPath = [...(category.path ?? []), category._id];

      updates.push({
        id: child._id,

        data: {
          level: newLevel,
          path: newPath,
        },
      });

      await this.updateChildrenTree({
        ...child.toObject(),

        level: newLevel,
        path: newPath,
      } as ICategoryDocument);
    }

    await this.categoryRepository.updateMany(updates);
  }

  //* =================== *\\

  async createCategory(input: CreateCategoryDto, image?: UploadedFile) {
    const slug = slugify(input.slug, {
      lower: true,
      strict: true,
      trim: true,
      replacement: "-",
    });

    const name = input.name.trim();

    const existingSlug = await this.categoryRepository.findBySlug(slug);

    if (existingSlug) {
      throw new AppError("Category slug already exists", 409);
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

  async getCategoryTree() {
    const categories = await this.categoryRepository.findAllForTree();

    const tree = this.buildCategoryTree(categories);

    return {
      message: "Category tree fetched successfully :)",
      data: {
        categories: tree,
      },
    };
  }

  async getCategoryBySlug(input: GetCategoryBySlugDto) {
    const slug = slugify(input.slug, {
      lower: true,
      strict: true,
      trim: true,
      replacement: "-",
    });

    const category = await this.categoryRepository.findBySlug(slug);

    if (!category) throw new AppError("Category not found :(", 404);

    return { message: "Category Fetched Successfully :)", data: category };
  }

  async getCategoryById(input: GetCategoryByIdDto) {
    const categoryId = input.categoryId;

    const category = await this.categoryRepository.findById(categoryId);

    if (!category) throw new AppError("Category not found :(", 404);

    return { message: "Category Fetched Successfully :)", data: category };
  }

  async updateCategory(input: UpdateCategoryDto, image?: UploadedFile) {
    const category = await this.categoryRepository.findById(input.categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const updateData: Partial<ICategoryDocument> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      updateData.name = name;
    }

    if (input.slug !== undefined) {
      const slug = slugify(input.slug, {
        lower: true,
        strict: true,
        trim: true,
        replacement: "-",
      });

      if (slug !== category.slug) {
        const existing = await this.categoryRepository.findBySlug(slug);

        if (existing && existing._id.toString() !== input.categoryId) {
          throw new AppError("Category slug already exists", 409);
        }
      }

      updateData.slug = slug;
    }

    if (input.description !== undefined) {
      updateData.description = input.description.trim();
    }

    if (input.order !== undefined) {
      updateData.order = input.order;
    }

    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    let parentChanged = false;

    const currentParent = category.parent?.toString() ?? null;

    const newParent =
      input.parent === null || input.parent === "null"
        ? null
        : input.parent !== undefined
          ? input.parent
          : currentParent;

    if (input.parent !== undefined && newParent !== currentParent) {
      parentChanged = true;

      let level = 0;
      let path: Types.ObjectId[] = [];

      if (newParent) {
        if (newParent === input.categoryId) {
          throw new AppError("Category cannot be its own parent", 400);
        }

        const parent = await this.categoryRepository.findById(newParent);

        if (!parent) {
          throw new AppError("Parent category not found", 404);
        }

        const parentPathIds = (parent.path ?? []).map((item) =>
          item.toString(),
        );

        if (parentPathIds.includes(input.categoryId)) {
          throw new AppError(
            "Category cannot be moved inside one of its descendants",
            400,
          );
        }

        if (parent.level >= this.categoryMaxDepth) {
          throw new AppError(
            `Maximum category depth of ${this.categoryMaxDepth} levels exceeded`,
            400,
          );
        }

        level = parent.level + 1;

        path = [...(parent.path ?? []), parent._id];
      }

      updateData.parent = newParent ? new Types.ObjectId(newParent) : null;

      updateData.level = level;
      updateData.path = path;
    }

    let uploadedImage:
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

      uploadedImage = {
        key: uploaded.key,
        url: uploaded.url,
      };

      updateData.image = uploadedImage;
    }

    let updatedCategory: ICategoryDocument;

    try {
      updatedCategory = await this.categoryRepository.update(
        input.categoryId,
        updateData,
      );
    } catch (err) {
      if (uploadedImage) {
        await this.storageService.deleteFile(uploadedImage.key);
      }
      throw err;
    }

    if (uploadedImage && category.image?.key) {
      await this.storageService.deleteFile(category.image.key);
    }

    if (parentChanged) {
      await this.updateChildrenTree(updatedCategory);
    }

    return {
      message: "Category updated Successfully :)",
      data: updatedCategory,
    };
  }

  async deleteCategory(input: DeleteCategoryDto) {
    const category = await this.categoryRepository.findById(input.categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // TODO: Check if the category or its descendants has any products associated with it before deletion If it does, throw an error indicating that the category cannot be deleted

    //* Double Check
    const confirmationPhrase = `DELETE CATEGORY ${category._id.toString()}`;

    if (input.confirmationPhrase !== confirmationPhrase) {
      throw new AppError(
        `Confirmation phrase does not match. To delete this category, please provide the following confirmation phrase: "${confirmationPhrase}"`,
        400,
      );
    }
    if (category.image?.key) {
      await this.storageService.deleteFile(category.image.key);
    }

    const deletedCategory = await this.categoryRepository.delete(
      category._id.toString(),
    );

    return {
      message: "Category deleted Successfully :)",
      data: deletedCategory,
    };
  }
}
