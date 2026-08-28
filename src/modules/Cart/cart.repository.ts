import { Types } from "mongoose";
import { CartModel, ICartDocument } from "./cart.model";
import { ICart } from "./cart.types";

export class CartRepository {
  async findByUserId(userId: string): Promise<ICartDocument | null> {
    return CartModel.findOne({
      userId: new Types.ObjectId(userId),
    });
  }

  async create(data: Pick<ICart, "userId">): Promise<ICartDocument> {
    return CartModel.create({
      userId: data.userId,
      items: [],
    });
  }

  async addItemIfNotExists(
    userId: string,
    productId: string,
  ): Promise<ICartDocument | null> {
    return CartModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),

        "items.productId": {
          $ne: new Types.ObjectId(productId),
        },
      },
      {
        $push: {
          items: {
            productId: new Types.ObjectId(productId),
            addedAt: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}
 