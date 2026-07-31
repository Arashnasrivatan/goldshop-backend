import { Request, Response, NextFunction } from "express";
import { PriceService } from "./price.service";

export class PriceController {
  constructor(private priceService: PriceService) {}

  getLatestPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
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
