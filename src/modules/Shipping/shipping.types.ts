import { Types } from "mongoose";

export type ShippingMethodType = "PICKUP" | "SHIPPING";

export interface ShippingMethodImage {
  url: string;
  key: string;
}

export interface IShippingMethod {
  _id: Types.ObjectId;
  name: string;
  description?: string | null;
  type: ShippingMethodType;
  image: ShippingMethodImage;

  price: number;

  isActive: boolean;

  sortOrder: number;
}
