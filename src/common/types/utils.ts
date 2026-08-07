export interface IPaginationData {
  page: number;
  limit: number;
  totalPage: number;
  [key: string]: number;
}

export interface IPriceCalculationResult {
  rawPrice: number;
  roundedPrice: number;
  details: {
    basePrice: number;
    wage?: number;
    profit: number;
    tax?: number;
    weight?: number;
  };
}
