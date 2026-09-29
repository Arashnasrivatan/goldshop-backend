import { ClientSession } from "mongoose";
import StoreSettingsModel from "./storeSettings.model";

export class StoreSettingsRepository {
  async getCheckoutStatus(session?: ClientSession): Promise<boolean> {
    const settings = await StoreSettingsModel.findOne({ key: "checkout" })
      .session(session ?? null)
      .lean();
    return settings?.orderRegistrationEnabled ?? true;
  }

  async updateCheckoutStatus(enabled: boolean) {
    return StoreSettingsModel.findOneAndUpdate(
      { key: "checkout" },
      { $set: { orderRegistrationEnabled: enabled }, $setOnInsert: { key: "checkout" } },
      { upsert: true, new: true, runValidators: true },
    );
  }
}
