import { PriceRepository } from "./price.repository";
import { PriceStatusService } from "./priceStatus.service";
import { IPriceDocument } from "./price.model";

export class PriceService {
  constructor(private readonly priceRepository: PriceRepository) {}

  public async getValidPriceForTransaction(): Promise<{
    allowed: boolean;
    message?: string;
    priceData?: IPriceDocument;
  }> {
    const status = PriceStatusService.isPriceDisplayAllowed();

    if (!status.allowed) {
      return { allowed: false, message: status.message };
    }

    const latestPrice = await this.priceRepository.findLatest();

    if (!latestPrice) {
      return {
        allowed: false,
        message: "No price records available in database.",
      };
    }

    return { allowed: true, priceData: latestPrice };
  }
}
