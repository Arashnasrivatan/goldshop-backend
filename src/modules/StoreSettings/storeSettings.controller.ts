import { NextFunction, Request, Response } from "express";
import response from "../../common/utils/response";
import { StoreSettingsService } from "./storeSettings.service";

export class StoreSettingsController {
  constructor(private readonly service: StoreSettingsService) {}

  getCheckoutStatus = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getCheckoutStatus();
      return response(res, 200, "Checkout settings fetched successfully", data);
    } catch (error) {
      next(error);
    }
  };

  updateCheckoutStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.updateCheckoutStatus(req.body.orderRegistrationEnabled);
      return response(res, 200, "Checkout settings updated successfully", data);
    } catch (error) {
      next(error);
    }
  };
}
