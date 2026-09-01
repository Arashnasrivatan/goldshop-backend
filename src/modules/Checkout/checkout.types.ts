import { Types } from "mongoose";

export type ProductType = "JEWELRY" | "COIN";
export type WageType = "PERCENT" | "FIXED";
export type CoinType = "EMAMI" | "BAHAR_AZADI" | "HALF" | "QUARTER" | "GRAM";
export type CheckoutStatus = "PENDING" | "PAID";

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

export interface ICheckoutAddress {
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

export interface ICheckoutItem {
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
  name: string;
  price: number;
}

export interface ICheckoutPayment {
  authority: string;
  amount: number;
  currency: "RIAL";
  createdAt: Date;
  paidAt?: Date | null;
}

export interface ICheckout {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: ICheckoutItem[];
  shipping: IShippingSnapshot;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: CheckoutStatus;
  payment: ICheckoutPayment;
  shippingAddress: ICheckoutAddress;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
