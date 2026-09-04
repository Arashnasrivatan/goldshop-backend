import { Request, Response, NextFunction } from "express";
import { CheckoutService } from "./checkout.service";
import { CreateCheckoutDto } from "./dto/createCheckout.dto";
import response from "../../common/utils/response";
import { IUserDocument } from "../User/user.model";
import { VerifyCheckoutDto } from "./dto/verifyCheckout.dto";

export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.user as IUserDocument;

      const userId = userData._id.toString();

      const { shippingMethodId, addressId } = req.body as {
        shippingMethodId: string;
        addressId: string;
      };

      const input: CreateCheckoutDto = new CreateCheckoutDto({
        userId,
        shippingMethodId,
        addressId,
      });

      const result = await this.checkoutService.createCheckout(input);

      return response(res, 201, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  verifyCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.user as IUserDocument;
      const userId = userData._id.toString();

      const trackId = (req.query as { trackId: string }).trackId;
      const input = new VerifyCheckoutDto({
        userId,
        trackId,
      });

      const result = await this.checkoutService.verifyCheckout(input);
      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };
}
