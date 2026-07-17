import { Types } from "mongoose";

export interface CategoryImage {
  url: string;
  key: string;
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parent?: Types.ObjectId | null;
  path: Types.ObjectId[];
  image: CategoryImage | null;
  level: number;
  isActive: boolean;
  order: number;
}
