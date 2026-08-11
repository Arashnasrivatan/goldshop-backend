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
import { GetProductBySlugDto } from "./dto/getProductBySlug.dto";
import { GetProductByIdDto } from "./dto/getProductById.dto";
import { UpdateProductDto } from "./dto/updateProduct.dto";
import { AddProductImagesDto } from "./dto/addProductImages.dto";
import { DeleteProductImagesDto } from "./dto/deleteProductImages.dto";
import { COIN_FIELDS, JEWELRY_FIELDS } from "./product.validaton";
import { DeleteProductDto } from "./dto/deleteProduct.dto";

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

  async getProductBySlug(input: GetProductBySlugDto) {
    let slug = input.slug;

    slug = slugify(slug, {
      lower: true,
      strict: true,
      trim: true,
      replacement: "-",
    });

    const product = await this.productRepository.findBySlug(slug, {
      path: "category",
      select: "name slug",
    });

    if (!product) throw new AppError("Product not found :(", 404);

    return { message: "Product fetched successfully :)", data: product };
  }

  async getProductById(input: GetProductByIdDto) {
    const product = await this.productRepository.findById(input.productId, {
      path: "category",
      select: "name slug",
    });

    if (!product) throw new AppError("Product not found :(", 404);

    return {
      message: "Product Fetched Successfully",
      data: product,
    };
  }

  async updateProduct(input: UpdateProductDto) {
    const { productId, updateData } = input;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields provided for update", 400);
    }

    const product = await this.productRepository.findById(productId);

    if (!product) throw new AppError("Product not found :(", 404);

    const type = product.type;

    switch (type) {
      case "JEWELRY": {
        const hasCoinField = COIN_FIELDS.some(
          (field) =>
            (updateData as Record<string, unknown>)[field] !== undefined,
        );

        if (hasCoinField)
          throw new AppError("Jewelry products can't have coin fields", 400);
        break;
      }
      case "COIN": {
        const hasJewelryField = JEWELRY_FIELDS.some(
          (field) =>
            (updateData as Record<string, unknown>)[field] !== undefined,
        );

        if (hasJewelryField)
          throw new AppError("Coin products can't have jewelry fields", 400);
        break;
      }
    }

    if (updateData.slug) {
      const newSlug = slugify(updateData.slug, {
        lower: true,
        strict: true,
        trim: true,
        replacement: "-",
      });

      const existingProductWithSlug =
        await this.productRepository.findBySlug(newSlug);

      if (
        existingProductWithSlug &&
        existingProductWithSlug._id.toString() !== productId
      ) {
        throw new AppError("A product with this slug already exists.", 409);
      }

      updateData.slug = newSlug;
    }

    if (updateData.category) {
      const newCategory = await this.categoryRepository.findById(
        updateData.category,
      );

      if (!newCategory) throw new AppError("Category not found :(", 404);

      updateData.category = newCategory._id.toString();
    }

    const updatedProduct = await this.productRepository.update(
      productId,
      updateData,
    );

    return {
      message: "Product Updated Successfully :)",
      data: updatedProduct,
    };
  }

  async deleteProduct(input: DeleteProductDto) {
    const product = await this.productRepository.findById(input.productId);

    if (!product) throw new AppError("Product not found :(", 404);

    //* Double Check
    const confirmationPhrase = `DELETE PRODUCT ${product._id.toString()}`;

    if (input.confirmationPhrase !== confirmationPhrase) {
      throw new AppError(
        `Confirmation phrase does not match. To delete this Product, please provide the following confirmation phrase: "${confirmationPhrase}"`,
        400,
      );
    }

    await Promise.all([
      // Soft Delete
      this.productRepository.update(
        input.productId,
        { isDeleted: true, isActive: false },
        // TODO: Delete product from users cart
      ),
    ]);

    return { message: "Product Deleted Successfully" };
  }

  async getProductImages(input: GetProductByIdDto) {
    const productImages = await this.productRepository.getImagesOnly(
      input.productId,
    );

    if (!productImages) throw new AppError("Product not found", 404);

    return {
      message: "Product images fetched successfully",
      data: productImages,
    };
  }

  async addProductImages(input: AddProductImagesDto, images: UploadedFile[]) {
    if (!images || images.length === 0) {
      throw new AppError("At least one image file is required.", 400);
    }

    const product = await this.productRepository.findById(input.productId);

    if (!product) throw new AppError("Product not found :(", 404);

    if (product.images.length + images.length > 10) {
      throw new AppError("products can not have more than 10 images", 400);
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
      const updatedProduct = await this.productRepository.addImages(
        input.productId,
        uploadedImages,
      );

      return {
        message: "Product images added successfully",
        data: updatedProduct,
      };
    } catch (err) {
      if (uploadedImages.length > 0) {
        const keysToDelete = uploadedImages.map((img) => img.key);
        this.storageService.deleteManyFiles(keysToDelete).catch((deleteErr) => {
          logger.error(
            `Failed to delete uploaded images after addProductImages failure: ${deleteErr.message}`,
          );
        });
      }

      throw new AppError("Failed to add product images", 500, err);
    }
  }

  async deleteProductImages(input: DeleteProductImagesDto) {
    if (!input.imageKeys || input.imageKeys.length === 0) {
      throw new AppError("At least one imageKey must be provided", 400);
    }

    const product = await this.productRepository.findById(input.productId);

    if (!product) throw new AppError("Product not found :(", 404);

    const keysToDelete = input.imageKeys.filter((key) =>
      product.images.some((image) => image.key === key),
    );

    if (keysToDelete.length === 0) {
      throw new AppError(
        "None of the provided image keys belong to the specified product.",
        404,
      );
    }

    const updatedImages = product.images.filter(
      (image) => !keysToDelete.includes(image.key),
    );

    const updatedProduct = await this.productRepository.update(
      input.productId,
      {
        images: updatedImages,
      },
    );

    try {
      await this.storageService.deleteManyFiles(keysToDelete);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "unknown error while deleting product image files from storage";

      logger.error(
        `Failed to delete product image files from storage after DB update: ${message}`,
      );
      throw new AppError(
        "Failed to delete product image files from storage.",
        500,
        err,
      );
    }

    return {
      message: "Product images deleted successfully",
      data: updatedProduct,
    };
  }
}
