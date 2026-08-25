import { AppError } from "../../common/errors/AppError";
import ImageProcessor from "../../common/services/image.processor";
import S3StorageService, {
  UploadedFile,
} from "../../common/services/S3StorageService";
import { CreateShippingDto } from "./dto/createShipping.dto";
import { ShippingRepository } from "./shipping.repository";
import { ShippingMethodImage } from "./shipping.types";

export class ShippingService {
  constructor(
    private readonly shippingRepository: ShippingRepository,
    private readonly storageService: S3StorageService,
  ) {}

  async createShipping(input: CreateShippingDto, image?: UploadedFile) {
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
}
