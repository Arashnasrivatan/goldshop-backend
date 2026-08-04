import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import response from "./../../common/utils/response";
import { UploadedFile } from "../../common/services/S3StorageService";
import { CreateProductDto } from "./dto/createProduct.dto";

export class ProductController {
  constructor(private productService: ProductService) {}

  private getUploadedImages(
    req: Request,
    fieldName: string = "images",
  ): UploadedFile[] {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const imageFiles = files?.[fieldName];

    if (!imageFiles || !Array.isArray(imageFiles) || imageFiles.length === 0) {
      return [];
    }

    return imageFiles.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    }));
  }

  getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        slug,
        description,
        type,
        stock,
        category,
        weight,
        wage,
        wageType,
        profitMargin,
        taxRate,
        coinType,
        coinProfit,
        coinProfitType,
        isActive,
        customFilters,
      } = req.body as CreateProductDto;

      const input: CreateProductDto = new CreateProductDto({
        name,
        slug,
        description,
        type,
        stock,
        category,
        weight,
        wage,
        wageType,
        profitMargin,
        taxRate,
        coinType,
        coinProfit,
        coinProfitType,
        isActive,
        customFilters,
      });

      const uploadedImages = this.getUploadedImages(req, "images");

      const result = await this.productService.createProduct(
        input,
        uploadedImages,
      );

      return response(res, 201, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getProductBySlug = async (
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

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  getProductImages = async (
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

  addProductImages = async (
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

  deleteProductImages = async (
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
}
