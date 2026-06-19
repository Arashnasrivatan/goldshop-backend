import BanModel, { IBanDocument } from "./ban.model";

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

  async findBanById(
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
}
