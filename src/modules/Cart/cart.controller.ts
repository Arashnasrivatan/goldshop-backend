import { Request, Response, NextFunction } from "express";
import response from "../../common/utils/response";
import { CartService } from "./cart.service";
import { AddItemDto } from "./dto/addItem.dto";
import { IUserDocument } from "../User/user.model";
import { UpdateItemDto } from "./dto/updateItem.dto";

export class CartController {
  constructor(private readonly cartService: CartService) {}

  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.user as IUserDocument;
      const userId = String(userData._id);

      const result = await this.cartService.getCart(userId);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.user as IUserDocument;
      const userId = String(userData._id);

      const result = await this.cartService.clearCart(userId);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.user as IUserDocument;
      const userId = String(userData._id);
      const { productId } = req.body as { productId: string };

      const input: AddItemDto = new AddItemDto({ productId, userId });

      const result = await this.cartService.addItemToCart(input);

      return response(res, 201, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.user as IUserDocument;
      const userId = String(userData._id);

      const { productId } = req.params as { productId: string };

      const { quantity } = req.body as {
        quantity: number;
      };

      const input: UpdateItemDto = new UpdateItemDto({
        userId,
        productId,
        quantity,
      });

      const result = await this.cartService.updateItem(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
}
