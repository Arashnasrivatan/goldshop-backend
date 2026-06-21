import { Types } from "mongoose";

export interface IBan {
  _id: Types.ObjectId;
  phone: string;
  user: Types.ObjectId;
  banReason: string;
  bannedBy: Types.ObjectId;
}

export interface IBanFilter {
  search?: string;
  phone?: string;
  userId?: string;
  bannedBy?: string;
  banReason?: string;
  from?: string;
  to?: string;
}
