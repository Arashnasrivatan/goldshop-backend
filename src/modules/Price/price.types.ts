import { Types } from "mongoose";

export interface IPrice {
  _id: Types.ObjectId;
  gold18k: number;
  goldBuy: number;
  goldExchange: number;
  coinQuarter: number;
  coinHalf: number;
  coinFull: number;
  coinEmami: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHistoryFilters {
  page?: number;
  limit?: number;
}
