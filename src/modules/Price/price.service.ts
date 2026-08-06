import { PriceRepository } from "./price.repository";
import { PriceStatusService } from "./priceStatus.service";
import { IPriceDocument } from "./price.model";
import { IPaginationData } from "../../common/types/utils";
import { createPaginationData, getTimeAgo } from "../../common/utils";
import { GetPriceHistoryDto } from "./dto/getPriceHistory.dto";

export class PriceService {
  constructor(private readonly priceRepository: PriceRepository) {}

  public async getValidPriceForTransaction(): Promise<{
    allowed: boolean;
    message?: string;
    priceData?: IPriceDocument & { timeAgo: string };
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

    const priceData = {
      ...latestPrice.toObject(),
      timeAgo: getTimeAgo(latestPrice.createdAt),
    };

    return { allowed: true, priceData };
  }

  async getPriceHistory(input: GetPriceHistoryDto) {
    const filters = {
      page: input.page,
      limit: input.limit,
    };

    const priceHistory = await this.priceRepository.findHistory(filters);

    const pagination: IPaginationData = await createPaginationData(
      filters.page,
      filters.limit,
      priceHistory.meta.total,
      "Price",
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedPrices = priceHistory.data.map((item: any) => {
      return {
        ...item,
        timeAgo: getTimeAgo(item.createdAt),
      };
    });

    return {
      message: "Price History Fetched Successfully",
      data: { pagination, prices: mappedPrices },
    };
  }
}
