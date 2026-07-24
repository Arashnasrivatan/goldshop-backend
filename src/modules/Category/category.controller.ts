import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/createCategory.dto";
import response from "./../../common/utils/response";
import { UploadedFile } from "../../common/services/S3StorageService";
import { GetAllCategoriesDto } from "./dto/getAllCategories.dto";
import { GetCategoryBySlugDto } from "./dto/getCategoryBySlug.dto";
import { GetCategoryByIdDto } from "./dto/getCategoryById.dto";
import { UpdateCategoryDto } from "./dto/updateCategory.dto";

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  private getUploadedImage(req: Request): UploadedFile | undefined {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const imageFile = files?.image?.[0];

    if (!imageFile) {
      return undefined;
    }

    return {
      fieldname: imageFile.fieldname,
      originalname: imageFile.originalname,
      encoding: imageFile.encoding,
      mimetype: imageFile.mimetype,
      size: imageFile.size,
      buffer: imageFile.buffer,
    };
  }

  getCategoryBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { slug } = req.params as { slug: string };

      const input: GetCategoryBySlugDto = new GetCategoryBySlugDto({ slug });

      const result = await this.categoryService.getCategoryBySlug(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoryService.getCategoryTree();

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const queryParams = req.query;

      const input: GetAllCategoriesDto = new GetAllCategoriesDto({
        search: queryParams.search as string,
        catId: queryParams.catId as string,
        slug: queryParams.slug as string,
        parent: queryParams.parent as string,
        level: queryParams.level as string,
        isActive: queryParams.isActive as string,
        sort: queryParams.sort as string,
        limit: queryParams.limit
          ? parseInt(queryParams.limit as string, 10)
          : 10,
        page: queryParams.page ? parseInt(queryParams.page as string, 10) : 1,
      });

      const result = await this.categoryService.getAllCategories(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, description, parent, isActive, order } = req.body as {
        name: string;
        slug: string;
        description?: string;
        parent?: string;
        isActive?: boolean;
        order?: number;
      };

      const input: CreateCategoryDto = new CreateCategoryDto({
        name,
        slug,
        description,
        parent,
        isActive,
        order,
      });

      const image = this.getUploadedImage(req);

      const result = await this.categoryService.createCategory(input, image);

      return response(res, 201, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params as { categoryId: string };

      const input: GetCategoryByIdDto = new GetCategoryByIdDto({ categoryId });

      const result = await this.categoryService.getCategoryById(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params as { categoryId: string };

      const image = this.getUploadedImage(req);

      const hasBodyData = Object.keys(req.body ?? {}).length > 0;

      if (!hasBodyData && !image) {
        return response(
          res,
          400,
          "At least one field must be provided for update",
        );
      }
      const { name, slug, description, parent, isActive, order } = req.body as {
        name?: string;
        slug?: string;
        description?: string;
        parent?: string;
        isActive?: boolean;
        order?: number;
      };

      const input: UpdateCategoryDto = new UpdateCategoryDto({
        categoryId,
        name,
        slug,
        description,
        parent,
        isActive,
        order,
      });

      const result = await this.categoryService.updateCategory(input, image);

      return response(res, 201, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
}
