import { Request, Response, NextFunction } from "express";
import { ShippingService } from "./shipping.service";
import { UploadedFile } from "../../common/services/S3StorageService";
import { CreateShippingDto } from "./dto/createShipping.dto";
import response from "../../common/utils/response";
import { GetAllShippingsDto } from "./dto/getAllShippings.dto";

export class ShippingController {
  constructor(private shippingService: ShippingService) {}

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

  getActiveShippingMethods = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.shippingService.getAllActive();

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getAllShippingMethods = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { search, isActive } = req.query as {
        search: string;
        isActive: string;
      };

      const input: GetAllShippingsDto = new GetAllShippingsDto({
        search,
        isActive,
      });

      const result = await this.shippingService.getAllShippings(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  createShippingMethod = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { name, description, price, isActive, sortOrder } = req.body as {
        name: string;
        description: string;
        price: string;
        isActive: string;
        sortOrder: string;
      };

      const input: CreateShippingDto = new CreateShippingDto({
        name,
        description,
        price,
        isActive,
        sortOrder,
      });

      const uploadedImage = this.getUploadedImage(req);

      const result = await this.shippingService.createShipping(
        input,
        uploadedImage,
      );

      return response(res, 201, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getShippingMethodById = async (
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

  updateShippingMethod = async (
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

  deleteShippingMethod = async (
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
