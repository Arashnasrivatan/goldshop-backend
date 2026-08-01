import { Request, Response, NextFunction } from "express";
import { PriceService } from "./price.service";
import response from "../../common/utils/response";

export class PriceController {
  constructor(private priceService: PriceService) {}

  getLatestPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const priceStatus = await this.priceService.getValidPriceForTransaction();

      if (!priceStatus.allowed) {
        return response(
          res,
          503,
          priceStatus.message ?? "Service unavailable for some reason",
          {
            isAvailable: false,
          },
        );
      }
      return response(res, 200, "Latest price fetched successfully", {
        isAvailable: true,
        prices: priceStatus.priceData,
      });
    } catch (err) {
      next(err);
    }
  };

  getPriceHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
}
