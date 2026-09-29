import mongoose, { Model, Schema } from "mongoose";

export interface IStoreSettings {
  key: string;
  orderRegistrationEnabled: boolean;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    key: { type: String, required: true, unique: true, immutable: true },
    orderRegistrationEnabled: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

const StoreSettingsModel: Model<IStoreSettings> = mongoose.model<IStoreSettings>(
  "StoreSettings",
  StoreSettingsSchema,
);

export default StoreSettingsModel;
