import mongoose, { Schema, Document, Model } from "mongoose";
import { IShippingMethod } from "./shipping.types";

export interface IShippingMethodDocument extends IShippingMethod, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ShippingMethodSchema = new Schema<IShippingMethodDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const ShippingModel: Model<IShippingMethodDocument> =
  mongoose.model<IShippingMethodDocument>(
    "ShippingMethod",
    ShippingMethodSchema,
  );

export default ShippingModel;
