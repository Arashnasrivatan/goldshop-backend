import { IUserDocument, UserRole } from "./user.model";

import { AdminUserUpdateDto } from "./dto/adminUserUpdate.dto";
import { AppError } from "../../common/errors/AppError";
import { CreateUserDto } from "./dto/createUser.dto";
import { GetAllUsersDto } from "./dto/getAllUsers.dto";
import { IPaginationData } from "../../common/types/utils";
import { UserIdDto } from "../../common/dto/userId.dto";
import { UserRepository } from "./user.repository";
import { createPaginationData } from "../../common/utils";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  //* ========== Common User Methods ========== *\\

  async isUserExistsByPhone(phone: string) {
    const user = await this.userRepository.findByPhone(phone);
    return !!user;
  }

  async isUserExistsById(userId: string) {
    const user = await this.userRepository.findById(userId);
    return !!user;
  }

  async findOneByPhone(phone: string) {
    return await this.userRepository.findByPhone(phone);
  }

  async findOneById(userId: string) {
    return await this.userRepository.findById(userId);
  }

  async createUser(input: CreateUserDto) {
    const newUser = await this.userRepository.create(input);

    return newUser;
  }

  async changeUserPassword(userId: string, newPassword: string) {
    await this.userRepository.updatePasswordById(userId, newPassword);
  }

  async markUserAsBanned(userId: string) {
    await this.userRepository.updateUserById(userId, { isBanned: true });
  }

  async markUserAsUnbanned(userId: string) {
    await this.userRepository.updateUserById(userId, { isBanned: false });
  }

  //* ========== Admin User Management ========== *\\

  async getAllUsers(input: GetAllUsersDto) {
    const { data: users, meta } = await this.userRepository.findAll(
      {
        search: input.search,
        userId: input.userId,
        phone: input.phone,
        from: input.from,
        to: input.to,
        role: input.role,
        includeBanned: input.includeBanned,
      },
      input.limit!,
      input.page!,
      input.sort!,
    );

    const paginationData: IPaginationData = createPaginationData(
      meta.page,
      meta.limit,
      meta.total,
      "Users",
    );

    return {
      message: "Users fetched Successfully :)",
      data: {
        paginationData,
        users,
      },
    };
  }

  async getOneUser(input: UserIdDto) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User Not Found :(", 404);

    const safeUser = user.toObject();

    delete safeUser.password;
    delete safeUser.__v;

    return {
      message: "user fetched successfully :)",
      data: safeUser,
    };
  }

  async adminUserUpdate(
    input: AdminUserUpdateDto,
  ): Promise<{ message: string; data: IUserDocument }> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User Not Found", 404);

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError("Cannot modify a SUPER_ADMIN", 403);
    }

    if (user.role === UserRole.ADMIN && input.adminRole === UserRole.ADMIN) {
      throw new AppError("Admins cannot modify other admins", 403);
    }

    if (input.fullname === user.fullname) {
      throw new AppError("No changes to update", 400);
    }

    const updatedUser = await this.userRepository.updateUserById(input.userId, {
      fullname: input.fullname,
    });

    if (!updatedUser)
      throw new AppError("Update failed :( Please try again later", 500);

    return { message: "User updated successfully", data: updatedUser };
  }
}
