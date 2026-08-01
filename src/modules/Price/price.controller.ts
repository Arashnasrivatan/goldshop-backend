import { Request, Response, NextFunction } from "express";
import { PriceService } from "./price.service";
import response from "../../common/utils/response";
import { GetPriceHistoryDto } from "./dto/getPriceHistory.dto";

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
      const { page = 1, limit = 10 } = req.query as {
        page?: string;
        limit?: string;
      };

      const input: GetPriceHistoryDto = new GetPriceHistoryDto({
        page: Number(page),
        limit: Number(limit),
      });

      const result = await this.priceService.getPriceHistory(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };
}
