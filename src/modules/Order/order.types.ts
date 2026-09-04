import { Types } from "mongoose";

export type ProductType = "JEWELRY" | "COIN";
export type WageType = "PERCENT" | "FIXED";
export type CoinType = "EMAMI" | "BAHAR_AZADI" | "HALF" | "QUARTER" | "GRAM";
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "READY_FOR_PICKUP"
  | "CANCELLED"
  | "REFUNDED";

export interface Image {
  url: string;
  key: string;
}

export interface IProductSnapshot {
  name: string;
  slug: string;
  image?: Image | null;
  type: ProductType;

  weight?: number | null;
  wage?: number | null;
  wageType?: WageType | null;
  profitMargin?: number | null;
  taxRate?: number | null;

  coinType?: CoinType | null;
  coinProfit?: number | null;
  coinProfitType?: WageType | null;
}

export interface IOrderAddress {
  addressId: Types.ObjectId;
  title: string;
  postalCode: string;
  location: {
    lat: number;
    lng: number;
    formatedLocation?: string | null;
  };
  address: string;
}

export interface IOrderItem {
  product: Types.ObjectId | null;
  productSnapshot: IProductSnapshot;
  priceUsed: number;
  priceSnapshotAt: Date;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IShippingSnapshot {
  method: Types.ObjectId;
  type: "PICKUP" | "SHIPPING";
  name: string;
  price: number;
}

export interface IOrderPayment {
  trackId?: string | null;
  paidAt?: Date | null;
}

export interface IOrder {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: IOrderItem[];
  shipping: IShippingSnapshot;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  payment: IOrderPayment;
  shippingAddress: IOrderAddress | null;
  checkoutId?: Types.ObjectId | null;
  postTrackingCode?: string | null;
  isDeleted: boolean;
  adminNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
