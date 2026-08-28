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
  isDeleted?: boolean;
  customFilters?: Map<string, unknown>;

  inStock: boolean;
}

export type ProductSortOption =
  | "newest"
  | "oldest"
  | "min_weight"
  | "max_weight"
  | "min_wage"
  | "max_wage";

export interface IProductFilter {
  search?: string;
  type?: "JEWELRY" | "COIN";
  category?: string;

  minStock?: number;
  maxStock?: number;

  minWeight?: number;
  maxWeight?: number;

  page?: number;
  limit?: number;
  sort?: ProductSortOption;

  inStockOnly?: string;
  includeInactive?: string;
  includeDeleted?: string;
  isActive?: string;
  isDeleted?: string;
}
