import { Request, Response, NextFunction } from "express";
import { CheckoutService } from "./checkout.service";

export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  verifyCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
}
