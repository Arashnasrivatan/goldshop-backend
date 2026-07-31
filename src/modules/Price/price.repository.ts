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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (filters.from || filters.to) {
      query.createdAt = {};

      if (filters.from) {
        query.createdAt.$gte = new Date(filters.from);
      }

      if (filters.to) {
        query.createdAt.$lte = new Date(filters.to);
      }
    }

    const [data, totalDocuments] = await Promise.all([
      PriceModel.find(query)
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit)
        .lean(),

      PriceModel.countDocuments(query),
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
