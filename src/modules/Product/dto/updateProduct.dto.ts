/* eslint-disable @typescript-eslint/no-explicit-any */

export class UpdateProductDto {
  public productId: string;
  public updateData: {
    name?: string;
    slug?: string;
    description?: string;
    stock?: number;
    category?: string;

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
  };

  constructor(data: { productId: string; updateData: any }) {
    this.productId = data.productId;
    this.updateData = data.updateData;
  }
}
