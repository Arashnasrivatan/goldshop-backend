import PriceModel, { IPriceDocument } from "./price.model";
import { CreatePriceDto } from "./dto/createPrice.dto";
import { IHistoryFilters } from "./price.types";

export class PriceRepository {
  async create(input: CreatePriceDto): Promise<IPriceDocument> {
    const price = new PriceModel(input);
    return await price.save();
  }

  async findLatest(): Promise<IPriceDocument | null> {
    return await PriceModel.findOne().sort({ createdAt: -1 });
  }
  async findHistory(filters: IHistoryFilters) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, totalDocuments] = await Promise.all([
      PriceModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

      PriceModel.countDocuments(),
    ]);

    return {
      data,
      meta: {
        total: totalDocuments,
        page,
        limit,
      },
    };
  }
}
