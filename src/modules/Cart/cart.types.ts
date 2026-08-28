import { Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart {
  userId: Types.ObjectId;
  items: ICartItem[];
}
