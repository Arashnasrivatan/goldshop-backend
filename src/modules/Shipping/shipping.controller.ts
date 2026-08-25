import { Request, Response, NextFunction } from "express";
import { ShippingService } from "./shipping.service";
import { UploadedFile } from "../../common/services/S3StorageService";

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
      // TODO
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
      // TODO
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
      // TODO
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
