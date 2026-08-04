/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductImage } from "../product.types";

export class CreateProductDto {
  public name: string;
  public slug: string;
  public description?: string;
  public type: "JEWELRY" | "COIN";
  public stock: number;
  public images?: ProductImage[];
  public category: string;

  public weight?: number;
  public wage?: number;
  public wageType?: "PERCENT" | "FIXED";
  public profitMargin?: number;
  public taxRate?: number;

  public coinType?: "EMAMI" | "BAHAR_AZADI" | "HALF" | "QUARTER" | "GRAM";
  public coinProfit?: number;
  public coinProfitType?: "PERCENT" | "FIXED";

  public isActive?: boolean;
  public customFilters?: Record<string, any>;

  constructor(data: {
    name: string;
    slug: string;
    description?: string;
    type: "JEWELRY" | "COIN";
    stock: number;
    images?: ProductImage[];
    category: string;
    weight?: number;
    wage?: number;
    wageType?: "PERCENT" | "FIXED";
    profitMargin?: number;
    taxRate?: number;
    coinType?: "EMAMI" | "BAHAR_AZADI" | "HALF" | "QUARTER" | "GRAM";
    coinProfit?: number;
    coinProfitType?: "PERCENT" | "FIXED";
    isActive?: boolean;
    customFilters?: Record<string, any>;
  }) {
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.type = data.type;
    this.stock = data.stock;
    this.images = data.images;
    this.category = data.category;

    this.weight = data.weight;
    this.wage = data.wage;
    this.wageType = data.wageType;

    this.profitMargin = data.profitMargin;
    this.taxRate = data.taxRate;

    this.coinType = data.coinType;
    this.coinProfit = data.coinProfit;
    this.coinProfitType = data.coinProfitType;

    this.isActive = data.isActive ?? true;
    this.customFilters = data.customFilters ?? {};
  }
}
