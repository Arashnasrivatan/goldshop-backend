import { Types } from "mongoose";

export interface ShippingMethodImage {
  url: string;
  key: string;
}

export interface IShippingMethod {
  _id: Types.ObjectId;
  name: string;
  description?: string | null;
  image: ShippingMethodImage;

  price: number;

  isActive: boolean;

  sortOrder: number;
}
