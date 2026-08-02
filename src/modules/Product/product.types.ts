import { Types } from "mongoose";

export interface ProductImage {
  url: string;
  key: string;
}

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  type: "JEWELRY" | "COIN";
  stock: number;
  images: ProductImage[];
  category: Types.ObjectId;
  weight?: number;
  wage?: number;
  wageType?: "PERCENT" | "FIXED";
  profitMargin?: number;
  taxRate?: number;

  coinType?: "EMAMI" | "BAHAR_AZADI" | "HALF" | "QUARTER" | "GRAM";
  coinProfit?: number;
  coinProfitType?: "PERCENT" | "FIXED";

  isActive?: boolean;
  customFilters?: Map<string, unknown>;
}
