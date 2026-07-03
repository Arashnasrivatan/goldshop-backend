import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/createCategory.dto";
import response from "./../../common/utils/response";

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

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
      const { name, slug, description, parent, isActive } = req.body as {
        name: string;
        slug: string;
        description?: string;
        parent?: string;
        isActive?: boolean;
      };

      const input: CreateCategoryDto = new CreateCategoryDto({
        name,
        slug,
        description,
        parent,
        isActive,
      });

      const result = await this.categoryService.createCategory(input);

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
