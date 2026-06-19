import { CreateUserDto } from "./dto/createUser.dto";
import UserModel, { IUserDocument } from "./user.model";

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
}
