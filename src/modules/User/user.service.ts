import { CreateUserDto } from "./dto/createUser.dto";
import { UserRepository } from "./user.repository";

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
}
