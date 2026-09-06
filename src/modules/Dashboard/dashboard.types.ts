export type DashboardPeriod =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "THIS_YEAR"
  | "ALL_TIME";

export interface IGetDashboardInput {
  period: DashboardPeriod;
}

export interface DashboardSales {
  sales: number;
  profit: number;
  orders: number;
}

export interface DashboardOrderStatistics {
  total: number;
  paid: number;
  processing: number;
  shipped: number;
  readyForPickup: number;
  delivered: number;
  cancelled: number;
  refunded: number;
}

export interface DashboardUserStatistics {
  total: number;
  newToday: number;
  newThisMonth: number;
}

export interface DashboardInventoryStatistics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  totalQuantity: number;
}

export interface DashboardMarketPrice {
  gold18k: number;
  goldBuy: number;
  goldExchange: number;
  coinQuarter: number;
  coinHalf: number;
  coinFull: number;
  coinEmami: number;
  createdAt: Date;
}

export interface DashboardSmsCredit {
  credit: number | null;
}

export interface DashboardMonthlyStatistic {
  month: string;
  sales: number;
  profit: number;
}

export interface DashboardResponse {
  period: DashboardPeriod;
  sales: DashboardSales;
  orders: DashboardOrderStatistics;
  users: DashboardUserStatistics;
  inventory: DashboardInventoryStatistics;
  marketPrice: DashboardMarketPrice | null;
  sms: DashboardSmsCredit;
  monthly: DashboardMonthlyStatistic[];
}
