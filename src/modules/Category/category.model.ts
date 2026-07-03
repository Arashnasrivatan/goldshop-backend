import mongoose, { Schema, Document, Model } from "mongoose";
import { ICategory } from "./category.types";

export interface ICategoryDocument extends ICategory, Document {
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    path: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        index: true,
      },
    ],
    level: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ path: 1 });
CategorySchema.index({ level: 1 });

const CategoryModel: Model<ICategoryDocument> =
  mongoose.model<ICategoryDocument>("Category", CategorySchema);

export default CategoryModel;
