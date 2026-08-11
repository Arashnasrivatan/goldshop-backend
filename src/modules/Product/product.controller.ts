import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import response from "./../../common/utils/response";
import { UploadedFile } from "../../common/services/S3StorageService";
import { CreateProductDto } from "./dto/createProduct.dto";
import { IProductFilter } from "./product.types";
import { GetAllProductsDto } from "./dto/getAllProducts.dto";
import { GetProductBySlugDto } from "./dto/getProductBySlug.dto";
import { GetProductByIdDto } from "./dto/getProductById.dto";
import { UpdateProductDto } from "./dto/updateProduct.dto";
import { DeleteProductDto } from "./dto/deleteProduct.dto";

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
      const {
        search,
        type,
        category,
        minStock,
        maxStock,
        minWeight,
        maxWeight,
        page,
        limit,
        sort,
        inStockOnly,
        includeInactive,
        isActive,
      } = req.query as IProductFilter;

      const input: GetAllProductsDto = new GetAllProductsDto({
        search,
        type,
        category,
        minStock,
        maxStock,
        minWeight,
        maxWeight,
        page,
        limit,
        sort,
        inStockOnly,
        includeInactive,
        isActive,
      });

      const result = await this.productService.getAllProducts(input);

      return response(res, 200, result.message, result.data);
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
      const { slug } = req.params as { slug: string };

      const input: GetProductBySlugDto = new GetProductBySlugDto({ slug });

      const result = await this.productService.getProductBySlug(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params as { productId: string };

      const input: GetProductByIdDto = new GetProductByIdDto({ productId });

      const result = await this.productService.getProductById(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params as { productId: string };
      const updatePayload = req.body;

      const input: UpdateProductDto = new UpdateProductDto({
        productId,
        updateData: updatePayload,
      });

      const result = await this.productService.updateProduct(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params as { productId: string };
      const { confirmationPhrase } = req.body as { confirmationPhrase: string };

      const input: DeleteProductDto = new DeleteProductDto({
        productId,
        confirmationPhrase,
      });

      const result = await this.productService.deleteProduct(input);

      return response(res, 200, result.message);
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
