import { AppError } from "../../common/errors/AppError";
import bcrypt from "bcrypt";
import { UserService } from "../User/user.service";
import { BanService } from "../Ban/ban.service";
import { RedisService } from "../../common/services/redis.service";
import { sendSms } from "../../common/services/sms.service";
import configs from "../../configs/env.config";

import { SendOtpDto } from "./dto/send-otp.dto";
import { IOtpDetails } from "./auth.types";

export class AuthService {
  constructor(
    private userService: UserService,
    private banService: BanService,
    private redisService: RedisService,
  ) {}

  //* Util Functions

  private getOtpRedisKey(phone: string): string {
    return `otp:${phone}`;
  }

  async generateOtp(phone: string, expireMinutes: number = 2): Promise<number> {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);
    const key = this.getOtpRedisKey(phone);

    const ttlSeconds = expireMinutes * 60;

    await this.redisService.set(key, hashedOtp, ttlSeconds);

    return otp;
  }

  async getOtpDetails(phone: string): Promise<IOtpDetails> {
    const key = this.getOtpRedisKey(phone);

    const ttl = await this.redisService.ttl(key);

    if (ttl === null || ttl <= 0) {
      return { expired: true, remainingTime: "00:00" };
    }

    const minutes = Math.floor(ttl / 60);
    const seconds = ttl % 60;

    const remainingTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    return { expired: false, remainingTime };
  }

  //* End Util Functions

  //* ========== Authentication Management ========== *\\

  async sendOTP(input: SendOtpDto) {
    const { phone } = input;

    const isPhoneBanned: boolean = await this.banService.isPhoneBanned(phone);

    if (isPhoneBanned) throw new AppError("You Are Banned", 403);

    const isUserExists: boolean =
      await this.userService.isUserExistsByPhone(phone);

    if (isUserExists) throw new AppError("A user exists with this info", 400);

    const { expired, remainingTime } = await this.getOtpDetails(phone);

    if (!expired) {
      throw new AppError(
        `Otp Already Sent Try Again After ${remainingTime}`,
        429,
        { expired, remainingTime },
      );
    }

    const otpCode = await this.generateOtp(phone);

    //* SMS Service
    const smsResult = await sendSms(
      phone,
      [{ name: "Code", value: otpCode }],
      configs.app.env === "production" ? configs.sms.pattern : "123456",
    );

    if (smsResult.status !== 1) {
      await this.redisService.del(this.getOtpRedisKey(phone));
      throw new AppError("Failed To Send Sms", 500, { smsResult });
    }

    return {
      message: "OTP Code Sent",
      ...(configs.app.env === "development" && { otpCode }),
    };
  }
}
