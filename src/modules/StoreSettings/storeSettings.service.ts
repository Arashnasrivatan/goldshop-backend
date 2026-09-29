import { ClientSession } from "mongoose";
import { AppError } from "../../common/errors/AppError";
import { StoreSettingsRepository } from "./storeSettings.repository";

export class StoreSettingsService {
  constructor(private readonly repository: StoreSettingsRepository) {}

  async getCheckoutStatus(session?: ClientSession) {
    return { orderRegistrationEnabled: await this.repository.getCheckoutStatus(session) };
  }

  async updateCheckoutStatus(enabled: boolean) {
    const settings = await this.repository.updateCheckoutStatus(enabled);
    return { orderRegistrationEnabled: settings!.orderRegistrationEnabled };
  }

  async ensureCheckoutOpen(session?: ClientSession) {
    if (!(await this.repository.getCheckoutStatus(session))) {
      throw new AppError("Order registration is currently unavailable.", 503);
    }
  }
}
