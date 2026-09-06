import { PriceRepository } from "../Price/price.repository";
import { smsService } from "../../common/services/sms.service";
import { DashboardRepository } from "./dashboard.repository";
import { DashboardResponse, IGetDashboardInput } from "./dashboard.types";

export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly priceRepository: PriceRepository,
  ) {}

  async getDashboard(input: IGetDashboardInput): Promise<DashboardResponse> {
    const dates = this.dashboardRepository.getPeriodDates(input.period);

    const [statistics, marketPrice, sms] = await Promise.all([
      this.dashboardRepository.getStatistics(dates),
      this.priceRepository.findLatest(),
      this.getSmsCredit(),
    ]);

    return {
      period: input.period,
      ...statistics,
      marketPrice: marketPrice
        ? {
            gold18k: marketPrice.gold18k,
            goldBuy: marketPrice.goldBuy,
            goldExchange: marketPrice.goldExchange,
            coinQuarter: marketPrice.coinQuarter,
            coinHalf: marketPrice.coinHalf,
            coinFull: marketPrice.coinFull,
            coinEmami: marketPrice.coinEmami,
            createdAt: marketPrice.createdAt,
          }
        : null,
      sms,
    };
  }

  private async getSmsCredit() {
    try {
      const result = await smsService.getCredit();
      const credit = Number(result.data);

      return {
        credit: Number.isFinite(credit) ? credit : null,
        available: result.status === 1 && Number.isFinite(credit),
      };
    } catch {
      return { credit: null, available: false };
    }
  }
}
