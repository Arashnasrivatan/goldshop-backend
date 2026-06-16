import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser, IUserAddress } from "./user.types";

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
}

const AddressesSchema = new Schema<IUserAddress>({
  title: { type: String, required: true },
  postalCode: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    formatedLocation: { type: String, default: null, required: false },
  },
  address: { type: String, required: true },
});

const UserSchema = new Schema<IUserDocument>(
  {
    fullname: { type: String, required: true },
    phone: { type: String, required: true, unique: true, max: 11, min: 11 },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    addresses: { type: [AddressesSchema], default: [], max: 5 },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  UserSchema,
);

export default UserModel;
