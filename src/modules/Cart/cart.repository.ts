import { Types } from "mongoose";
import { CartModel, ICartDocument } from "./cart.model";
import { ICart } from "./cart.types";

export class CartRepository {
  async findByUserId(userId: string): Promise<ICartDocument | null> {
    return CartModel.findOne({
      userId: new Types.ObjectId(userId),
    }).populate({
      path: "items.productId",
      select: [
        "name",
        "slug",
        "type",
        "stock",
        "images",
        "weight",
        "wage",
        "wageType",
        "profitMargin",
        "taxRate",
        "coinType",
        "coinProfit",
        "coinProfitType",
        "isActive",
        "isDeleted",
      ].join(" "),
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
    ).populate({
      path: "items.productId",
      select: [
        "name",
        "slug",
        "type",
        "stock",
        "images",
        "weight",
        "wage",
        "wageType",
        "profitMargin",
        "taxRate",
        "coinType",
        "coinProfit",
        "coinProfitType",
        "isActive",
        "isDeleted",
      ].join(" "),
    });
  }

  async clearCart(userId: string): Promise<ICartDocument | null> {
    return CartModel.findOneAndUpdate(
      {
        userId,
      },
      {
        $set: {
          items: [],
        },
      },
      {
        new: true,
      },
    );
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<ICartDocument | null> {
    return CartModel.findOneAndUpdate(
      {
        userId,
        "items.productId": productId,
      },
      {
        $set: {
          "items.$.quantity": quantity,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate({
      path: "items.productId",
      select: [
        "name",
        "slug",
        "type",
        "stock",
        "images",
        "weight",
        "wage",
        "wageType",
        "profitMargin",
        "taxRate",
        "coinType",
        "coinProfit",
        "coinProfitType",
        "isActive",
        "isDeleted",
      ].join(" "),
    });
  }

  async removeItem(
    userId: string,
    productId: string,
  ): Promise<ICartDocument | null> {
    return CartModel.findOneAndUpdate(
      {
        userId,
        "items.productId": productId,
      },
      {
        $pull: {
          items: {
            productId,
          },
        },
      },
      {
        new: true,
      },
    );
  }

  async removeItemFromAllCarts(productId: string): Promise<void> {
    await CartModel.updateMany(
      {
        "items.productId": productId,
      },
      {
        $pull: {
          items: {
            productId,
          },
        },
      },
    );
  }
}
