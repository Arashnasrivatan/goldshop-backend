import { DeleteResult } from "mongoose";
import BanModel, { IBanDocument } from "./ban.model";
import { IBanFilter } from "./ban.types";

export class BanRepository {
  async findBanByPhone(
    phone: string,
    populate: boolean = false,
  ): Promise<IBanDocument | null> {
    const query = BanModel.findOne({ phone });

    if (populate) {
      query.populate("user bannedBy", "fullname phone role");
    }

    query.select("-__v");

    return await query.exec();
  }

  async findBanByUserId(
    userId: string,
    populate: boolean = false,
  ): Promise<IBanDocument | null> {
    const query = BanModel.findOne({ user: userId });

    if (populate) {
      query.populate("user bannedBy", "fullname phone role");
    }

    query.select("-__v");

    return await query.exec();
  }

  async findBanById(
    banId: string,
    populate: boolean = false,
  ): Promise<IBanDocument | null> {
    const query = BanModel.findOne({ _id: banId });

    if (populate) {
      query.populate("user bannedBy", "fullname phone role");
    }

    query.select("-__v");

    return await query.exec();
  }

  async findAll(
    filter: IBanFilter,
    limit: number = 10,
    page: number = 1,
    sort: string = "desc",
  ) {
    const sortOrder = sort === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (filter.search) {
      query.$or = [
        { phone: new RegExp(filter.search, "i") },
        { banReason: new RegExp(filter.search, "i") },
      ];
    }
    if (filter.phone) query.phone = new RegExp(filter.phone, "i");
    if (filter.userId) query.user = filter.userId;
    if (filter.bannedBy) query.bannedBy = filter.bannedBy;
    if (filter.banReason) query.banReason = new RegExp(filter.banReason, "i");

    if (filter.from || filter.to) {
      query.createdAt = {};
      if (filter.from) query.createdAt.$gte = new Date(filter.from);
      if (filter.to) query.createdAt.$lte = new Date(filter.to);
    }

    const [data, total] = await Promise.all([
      BanModel.find(query)
        .populate("user bannedBy", "fullname phone role")
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      BanModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async banUser(
    userId: string,
    userPhone: string,
    banReason: string,
    adminId: string,
  ): Promise<IBanDocument> {
    const ban = new BanModel({
      phone: userPhone,
      user: userId,
      banReason,
      bannedBy: adminId,
    });

    return await ban.save();
  }

  async unbanUser(banId: string): Promise<DeleteResult> {
    return await BanModel.deleteOne({ _id: banId });
  }
}
