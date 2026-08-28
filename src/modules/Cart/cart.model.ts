import mongoose, { Schema, Document, Model } from "mongoose";
import { ICart } from "./cart.types";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICartDocument extends ICart, Document {
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const CartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const CartModel: Model<ICartDocument> = mongoose.model<ICartDocument>(
  "Cart",
  CartSchema,
);
