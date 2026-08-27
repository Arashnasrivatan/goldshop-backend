import { AppError } from "../../common/errors/AppError";
import ImageProcessor from "../../common/services/image.processor";
import S3StorageService, {
  UploadedFile,
} from "../../common/services/S3StorageService";
import { CreateShippingDto } from "./dto/createShipping.dto";
import { GetAllShippingsDto } from "./dto/getAllShippings.dto";
import { GetShippingDto } from "./dto/getShipping.dto";
import { UpdateShippingDto } from "./dto/updateShipping.dto";
import { ShippingRepository } from "./shipping.repository";
import { IShippingMethod, ShippingMethodImage } from "./shipping.types";

export class ShippingService {
  constructor(
    private readonly shippingRepository: ShippingRepository,
    private readonly storageService: S3StorageService,
  ) {}

  async getAllActive() {
    const activeShippings = await this.shippingRepository.findAllActive();

    return {
      message: "Shipping Methods fetched successfully :)",
      data: activeShippings,
    };
  }

  async getAllShippings(input: GetAllShippingsDto) {
    const shippings = await this.shippingRepository.findAll(input);

    return {
      message: "Shipping Methods Fetched Successfully",
      data: shippings,
    };
  }

  async createShipping(input: CreateShippingDto, image?: UploadedFile) {
    const totalShippingMethods = await this.shippingRepository.countDocuments();

    if (totalShippingMethods >= 10) {
      throw new AppError("Maximum number of shipping methods is 10", 400);
    }

    const name = input.name.trim();

    const isNameDuplicated = await this.shippingRepository.findByName(name);

    if (isNameDuplicated)
      throw new AppError("Shipping Method name already exists", 409);
    // important
    if (!image) {
      throw new AppError("Shipping method image is required", 400);
    }

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
      folder: "shipping-methods",
      visibility: "public",
    });

    const shippingMethodImage: ShippingMethodImage = {
      url: uploaded.url,
      key: uploaded.key,
    };

    const shipping = await this.shippingRepository.create({
      ...input,
      name,
      image: shippingMethodImage,
    });
    return {
      message: "Shipping Method created Successfully :)",
      data: shipping,
    };
  }

  async getShippingById(input: GetShippingDto) {
    const shipping = await this.shippingRepository.findById(input.shippingId);

    if (!shipping) throw new AppError("Shipping Method not found", 404);

    return { message: "Shipping Method Fetched Successfully", data: shipping };
  }

  async updateShipping(input: UpdateShippingDto, image?: UploadedFile) {
    const { shippingId, name, description, price, isActive, sortOrder } = input;

    const shippingMethod = await this.shippingRepository.findById(shippingId);

    if (!shippingMethod) {
      throw new AppError("Shipping Method not found", 404);
    }

    if (name && name !== shippingMethod.name) {
      const isNameDuplicated = await this.shippingRepository.findByName(name);

      if (isNameDuplicated) {
        throw new AppError("Shipping Method name already exists", 409);
      }
    }

    const updateData: Partial<IShippingMethod> = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    if (price !== undefined) {
      updateData.price = Number(price);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === "true";
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = Number(sortOrder);
    }

    let oldImageKey: string | undefined;

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

      try {
        const uploaded = await this.storageService.upload(image, {
          folder: "shipping-methods",
          visibility: "public",
        });

        const shippingMethodImage: ShippingMethodImage = {
          url: uploaded.url,
          key: uploaded.key,
        };

        updateData.image = shippingMethodImage;

        if (shippingMethod.image?.key) {
          oldImageKey = shippingMethod.image.key;
        }
      } catch (err) {
        throw new AppError("Failed to upload shipping method image", 500, err);
      }
    }

    const updatedShippingMethod = await this.shippingRepository.updateById(
      shippingId,
      updateData,
    );

    if (oldImageKey) {
      try {
        await this.storageService.deleteFile(oldImageKey);
      } catch (err) {
        console.error("Failed to delete old shipping method image:", err);
      }
    }

    return {
      message: "Shipping Method Updated Successfully",
      data: updatedShippingMethod,
    };
  }
}
