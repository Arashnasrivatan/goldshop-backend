import { BanRepository } from "./ban.repository";
import { UserService } from "./../User/user.service";

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
}
