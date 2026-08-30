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
  image?: Image;
  type: ProductType;

  weight?: number;
  wage?: number;
  wageType?: WageType;
  profitMargin?: number;
  taxRate?: number;

  coinType?: CoinType;
  coinProfit?: number;
  coinProfitType?: WageType;
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
  product: Types.ObjectId;
  productSnapshot: IProductSnapshot;
  priceUsed: number;
  priceSnapshotAt: Date;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IShippingSnapshot {
  method: Types.ObjectId;
  name: string;
  price: number;
}

export interface IOrderPayment {
  authority?: string | null;
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
  shippingAddress: IOrderAddress;
  postTrackingCode?: string | null;
  isDeleted: boolean;
  adminNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
