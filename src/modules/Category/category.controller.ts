import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/createCategory.dto";
import response from "./../../common/utils/response";
import { UploadedFile } from "../../common/services/S3StorageService";

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
      // TODO
    } catch (err) {
      next(err);
    }
  };

  getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
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
      // TODO
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
      // TODO
    } catch (err) {
      next(err);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
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
