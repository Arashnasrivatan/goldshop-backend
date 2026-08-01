import mongoose, { Schema, Document, Model } from "mongoose";
import { IPrice } from "./price.types";

export interface IPriceDocument extends IPrice, Document {
  createdAt: Date;
  updatedAt: Date;
}

const PriceSchema = new Schema<IPriceDocument>(
  {
    gold18k: { type: Number, required: true },
    goldBuy: { type: Number, required: true },
    goldExchange: { type: Number, required: true },
    coinQuarter: { type: Number, required: true },
    coinHalf: { type: Number, required: true },
    coinFull: { type: Number, required: true },
    coinEmami: { type: Number, required: true },
  },
  { timestamps: true },
);

PriceSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const PriceModel: Model<IPriceDocument> = mongoose.model<IPriceDocument>(
  "Price",
  PriceSchema,
);

export default PriceModel;
