import { Types } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parent?: Types.ObjectId | null;
  path: Types.ObjectId[];
  level: number;
  isActive: boolean;
  order: number;
}
