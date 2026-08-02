import mongoose, { Schema, Document, Model } from "mongoose";
import { IProduct } from "./product.types";

export interface IProductDocument extends IProduct, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: null },
    type: {
      type: String,
      enum: ["JEWELRY", "COIN"],
      required: true,
      index: true,
    },
    stock: { type: Number, required: true, default: 1 },
    images: [
      {
        url: { type: String, required: true },
        key: { type: String, required: true },
      },
    ],

    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
      index: true,
    },

    weight: {
      type: Number,
      required: function (this: IProductDocument) {
        return this.type === "JEWELRY";
      },
    },

    wage: {
      type: Number,
      required: function (this: IProductDocument) {
        return this.type === "JEWELRY";
      },
    },
    wageType: {
      type: String,
      enum: ["PERCENT", "FIXED"],
      default: "PERCENT",
    },

    profitMargin: { type: Number, default: 7 },
    taxRate: { type: Number, default: 10 },

    coinType: {
      type: String,
      enum: ["EMAMI", "BAHAR_AZADI", "HALF", "QUARTER", "GRAM"],
      required: function (this: IProductDocument) {
        return this.type === "COIN";
      },
    },
    coinProfit: {
      type: Number,
      required: function (this: IProductDocument) {
        return this.type === "COIN";
      },
    },
    coinProfitType: {
      type: String,
      enum: ["PERCENT", "FIXED"],
      default: "FIXED",
    },

    isActive: { type: Boolean, default: true, index: true },
    customFilters: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

const ProductModel: Model<IProductDocument> = mongoose.model<IProductDocument>(
  "Product",
  ProductSchema,
);

export default ProductModel;
