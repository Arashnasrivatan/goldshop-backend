import { ProductRepository } from "./product.repository";
import { CategoryRepository } from "../Category/category.repository";

import { AppError } from "../../common/errors/AppError";
import ImageProcessor from "../../common/services/image.processor";

import S3StorageService, {
  type UploadedFile,
} from "../../common/services/S3StorageService";
import { CreateProductDto } from "./dto/createProduct.dto";
import slugify from "slugify";
import logger from "../../common/utils/logger";
import { GetAllProductsDto } from "./dto/getAllProducts.dto";
import { IPaginationData } from "../../common/types/utils";
import { createPaginationData } from "../../common/utils";

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly storageService: S3StorageService,
  ) {}

  async getAllProducts(input: GetAllProductsDto) {
    try {
      const page = Number(input.page) || 1;
      const limit = Number(input.limit) || 20;

      const { products, totalCount } = await this.productRepository.find({
        ...input,
        page,
        limit,
      });

      const pagination: IPaginationData = createPaginationData(
        page,
        limit,
        totalCount,
        "Product",
      );

      return {
        message: "Products fetched successfully",
        data: { pagination, products },
      };
    } catch (err) {
      throw new AppError(`Failed to fetch products`, 500, err);
    }
  }

  async createProduct(input: CreateProductDto, images: UploadedFile[]) {
    const slug = slugify(input.slug, {
      lower: true,
      strict: true,
      trim: true,
      replacement: "-",
    });

    const existingSlug = await this.productRepository.findBySlug(slug);
    if (existingSlug) {
      throw new AppError("A product with this slug already exists.", 409);
    }

    const categoryExists = await this.categoryRepository.findById(
      input.category,
    );
    if (!categoryExists) {
      throw new AppError("The specified category does not exist.", 404);
    }

    if (!images || images.length === 0) {
      throw new AppError("At least one product image is required.", 400);
    }

    for (const image of images) {
      if (
        !image.mimetype ||
        !ImageProcessor.isSupportedImageMimeType(image.mimetype)
      ) {
        throw new AppError(
          "Unsupported image format. Allowed formats: JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF, HEIF.",
          400,
        );
      }
    }

    let uploadedImages: { url: string; key: string }[] = [];
    try {
      uploadedImages = await this.storageService.uploadMany(images, {
        folder: "products",
        visibility: "public",
      });
    } catch (err) {
      throw new AppError(
        "Failed to upload images to the storage server.",
        500,
        err,
      );
    }

    try {
      const sanitizedInput = { ...input };

      if (sanitizedInput.type === "JEWELRY") {
        sanitizedInput.coinType = undefined;
        sanitizedInput.coinProfit = undefined;
        sanitizedInput.coinProfitType = undefined;
      } else if (sanitizedInput.type === "COIN") {
        sanitizedInput.weight = undefined;
        sanitizedInput.wage = undefined;
        sanitizedInput.wageType = undefined;
        sanitizedInput.profitMargin = undefined;
        sanitizedInput.taxRate = undefined;
      }

      const productData = {
        ...sanitizedInput,
        slug,
        images: uploadedImages,
      };

      const newProduct = await this.productRepository.create(productData);

      return { message: "Product created successfully :)", data: newProduct };
    } catch (err) {
      if (uploadedImages && uploadedImages.length > 0) {
        const keysToDelete = uploadedImages.map((img) => img.key);
        this.storageService.deleteManyFiles(keysToDelete).catch((deleteErr) => {
          logger.error(
            `Failed to delete uploaded images after product creation failure: ${deleteErr.message}`,
          );
        });
      }

      throw new AppError(`Failed to save product in database`, 500, err);
    }
  }
}
