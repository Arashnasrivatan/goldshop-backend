import { BanRepository } from "./ban.repository";
import { UserService } from "./../User/user.service";
import { BanUserDto } from "./dto/banUser.dto";
import { AppError } from "../../common/errors/AppError";
import { UserRole } from "../User/user.model";
import { IPaginationData } from "../../common/types/utils";
import { createPaginationData } from "../../common/utils";
import { GetAllBansDto } from "./dto/getAllBans.dto";
import { BanIdDto } from "./dto/banId.dto";
import { EditBanDto } from "./dto/editBan.dto";

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

  async getAllBans(input: GetAllBansDto) {
    const { data: bannedUsers, meta } = await this.banRepository.findAll(
      {
        search: input.search,
        phone: input.phone,
        userId: input.userId,
        bannedBy: input.bannedBy,
        banReason: input.banReason,
        from: input.from,
        to: input.to,
      },
      input.limit!,
      input.page!,
      input.sort!,
    );

    const paginationData: IPaginationData = createPaginationData(
      meta.page,
      meta.limit,
      meta.total,
      "BannedUsers",
    );

    return {
      message: "Banned Users fetched Successfully :)",
      data: {
        paginationData,
        bannedUsers,
      },
    };
  }

  async getBan(input: BanIdDto) {
    const banRecord = await this.banRepository.findBanById(input.banId, true);

    if (!banRecord) {
      throw new AppError("Ban Record not found", 404);
    }

    return { message: "Ban Record fetched successfully", data: banRecord };
  }

  async banUser(input: BanUserDto) {
    const user = await this.userService.findOneById(input.userId);

    if (!user) throw new AppError("User not found!", 404);

    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN)
      throw new AppError("You cant ban ADMINS!", 403);

    const isUserAlreadyBanned = await this.banRepository.findBanByUserId(
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

  async editBan(input: EditBanDto) {
    const banRecord = await this.banRepository.findBanById(input.banId, true);

    if (!banRecord) throw new AppError("Ban Record not found", 404);

    if (input.banReason === banRecord.banReason)
      throw new AppError("Ban reason not changed", 400);

    const updatedBan = await this.banRepository.updateBanById(input.banId, {
      banReason: input.banReason,
    });

    if (!updatedBan) throw new AppError("Ban Record not found", 404);

    return { message: "Ban Record Updated Successfully :)", data: updatedBan };
  }

  async unbanUser(input: BanIdDto) {
    const banRecord = await this.banRepository.findBanById(input.banId, true);

    if (!banRecord) throw new AppError("Ban Record not found", 404);

    await Promise.all([
      this.banRepository.unbanUser(input.banId),
      this.userService.markUserAsUnbanned(banRecord.user._id.toString()),
    ]);

    return { message: "User Unbanned Successfully :)", data: banRecord };
  }
}
