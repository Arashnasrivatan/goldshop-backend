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

export interface ICategoryFilter {
  search?: string;
  catId?: string;
  slug?: string;
  parent?: string;
  level?: string;
  isActive?: string;
}

export interface ICategoryTreeNode {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string | null;
  parent?: Types.ObjectId | null;
  path: Types.ObjectId[];
  image: CategoryImage | null;
  level: number;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  children: ICategoryTreeNode[];
}
