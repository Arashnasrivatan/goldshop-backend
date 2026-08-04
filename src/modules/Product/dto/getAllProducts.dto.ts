import { ProductSortOption } from "../product.types";

export class GetAllProductsDto {
  public search?: string;
  public type?: "JEWELRY" | "COIN";
  public category?: string;
  public minStock?: number;
  public maxStock?: number;
  public minWeight?: number;
  public maxWeight?: number;
  public page?: number;
  public limit?: number;
  public sort?: ProductSortOption;
  public inStockOnly?: string;

  // Inactive products are hidden by business logic, not for security reasons
  // Exposing them does not pose a security risk
  public includeInactive?: string;
  public isActive?: string;

  constructor(data: {
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
    isActive?: string;
  }) {
    this.search = data.search;
    this.type = data.type;
    this.category = data.category;
    this.minStock = data.minStock;
    this.maxStock = data.maxStock;
    this.minWeight = data.minWeight;
    this.maxWeight = data.maxWeight;
    this.page = data.page;
    this.limit = data.limit;
    this.sort = data.sort;
    this.inStockOnly = data.inStockOnly;
    this.includeInactive = data.includeInactive;
    this.isActive = data.isActive;
  }
}
