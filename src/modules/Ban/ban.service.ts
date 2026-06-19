import { BanRepository } from "./ban.repository";
import { UserService } from "./../User/user.service";
import { BanUserDto } from "./dto/banUser.dto";
import { AppError } from "../../common/errors/AppError";
import { UserRole } from "../User/user.model";

export class BanService {
  constructor(
    private banRepository: BanRepository,
    private userService: UserService,
  ) {}

  //* ========== Ban Management ========== *\\

  async isPhoneBanned(phone: string): Promise<boolean> {
    const banRecord = await this.banRepository.findBanByPhone(phone);

    return !!banRecord;
  }

  async banUser(input: BanUserDto) {
    const user = await this.userService.findOneById(input.userId);

    if (!user) throw new AppError("User not found!", 404);

    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN)
      throw new AppError("You cant ban ADMINS!", 403);

    const isUserAlreadyBanned = await this.banRepository.findBanById(
      user._id.toString(),
    );

    if (isUserAlreadyBanned)
      throw new AppError("This User is Already Banned", 400);

    await Promise.all([
      this.banRepository.banUser(
        user._id.toString(),
        user.phone,
        input.banReason,
        input.adminId,
      ),
      this.userService.markUserAsBanned(user._id.toString()),
    ]);

    return { message: "User Banned Successfully" };
  }
}
