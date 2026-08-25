import mongoose, { Schema, Model, HydratedDocument } from "mongoose";
import { IShippingMethod } from "./shipping.types";

export type IShippingMethodDocument = HydratedDocument<IShippingMethod> & {
  createdAt: Date;
  updatedAt: Date;
};

const ShippingMethodSchema = new Schema<IShippingMethod>(
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
    image: {
      type: {
        url: { type: String, required: true },
        key: { type: String, required: true },
      },
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

const ShippingModel: Model<IShippingMethod> = mongoose.model<IShippingMethod>(
  "ShippingMethod",
  ShippingMethodSchema,
);

export default ShippingModel;