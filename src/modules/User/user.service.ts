import { CreateUserDto } from "./dto/createUser.dto";
import { GetAllUsersDto } from "./dto/getAllUsers.dto";
import { IPaginationData } from "../../common/types/utils";
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
}
