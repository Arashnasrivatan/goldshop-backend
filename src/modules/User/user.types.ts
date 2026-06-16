import { Types } from "mongoose";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface IUserAddress {
  _id: string;
  title: string;
  postalCode: string;
  location: {
    lat: number;
    lng: number;
    formatedLocation?: string;
  };
  address: string;
}

export interface IUser {
  _id: Types.ObjectId;
  fullname: string;
  phone: string;
  password: string;
  role: UserRole;
  addresses: IUserAddress[];
  isBanned: boolean;
}

export interface IUserFilter {
  search?: string;
  userId?: string;
  phone?: string;
  from?: string;
  to?: string;
  role?: string;
  includeBanned?: boolean;
}
