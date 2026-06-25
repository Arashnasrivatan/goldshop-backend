import UserModel, { IUserDocument } from "./user.model";

import { CreateUserDto } from "./dto/createUser.dto";
import { IUserFilter } from "./user.types";

export class UserRepository {
  async findById(userId: string): Promise<IUserDocument | null> {
    return await UserModel.findOne({ _id: userId });
  }

  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return await UserModel.findOne({ phone });
  }

  async create(input: CreateUserDto): Promise<IUserDocument> {
    const { fullname, phone, password } = input;
    const user = await UserModel.create({
      fullname,
      phone,
      password,
    });
    return user;
  }

  async updatePasswordById(
    userId: string,
    hashedPassword: string,
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          password: hashedPassword,
        },
      },
    );
  }

  //* ============================== *\\

  async findAll(
    filter: IUserFilter,
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
        { userId: new RegExp(filter.search, "i") },
      ];
    }
    if (filter.phone) query.phone = new RegExp(filter.phone, "i");
    if (filter.userId) query._id = filter.userId;
    if (filter.role) query.role = filter.role;

    if (filter.from || filter.to) {
      query.createdAt = {};
      if (filter.from) query.createdAt.$gte = new Date(filter.from);
      if (filter.to) query.createdAt.$lte = new Date(filter.to);
    }

    if (!filter.includeBanned) {
      query.isBanned = { $ne: true };
    }

    const [data, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      UserModel.countDocuments(query),
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

  async updateUserById(
    userId: string,
    updateData: Partial<IUserDocument>,
  ): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password -__v");
  }

  async deleteUserById(userId: string): Promise<IUserDocument | null> {
    return await UserModel.findByIdAndDelete(userId).select("-__v -password");
  }

  async deleteUserRelatedData(userId: string): Promise<void> {
    void userId;
    // Add related data cleanup here when additional collections are implemented. // TODO
    return;
  }
}
