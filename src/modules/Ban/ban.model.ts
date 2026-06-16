import mongoose, { Schema, Document, Model } from "mongoose";
import { IBan } from "./ban.types";

export interface IBanDocument extends IBan, Document {
  createdAt: Date;
  updatedAt: Date;
}

const BanSchema = new Schema<IBanDocument>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      min: 11,
      max: 11,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    banReason: {
      type: String,
      required: true,
    },
    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const BanModel: Model<IBanDocument> = mongoose.model<IBanDocument>(
  "Ban",
  BanSchema,
);

export default BanModel;
