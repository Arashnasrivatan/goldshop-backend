import { Types } from "mongoose";

export interface IBan {
  _id: Types.ObjectId;
  phone: string;
  user: Types.ObjectId;
  banReason: string;
  bannedBy: Types.ObjectId;
}