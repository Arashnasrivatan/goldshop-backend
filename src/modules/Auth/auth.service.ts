import { AppError } from "../../common/errors/AppError";
import bcrypt from "bcrypt";
import { UserService } from "../User/user.service";
import { BanService } from "../Ban/ban.service";
import { RedisService } from "../../common/services/redis.service";
import { sendSms } from "../../common/services/sms.service";
import configs from "../../configs/env.config";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { SendOtpDto } from "./dto/sendOTP.dto";
import { IOtpDetails } from "./auth.types";
import { IUserDocument } from "../User/user.model";
import { VerifyOtpDto } from "./dto/verifyOTP.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { RefreshTokenDto } from "./dto/refreshToken.dto";

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

  private getResetTokenKey(tokenHash: string): string {
    return `resetToken:${tokenHash}`;
  }

  private getResetRequestKey(phone: string): string {
    return `resetTokenReq:${phone}`;
  }

  private hashResetToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
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

  async verifyOTP(input: VerifyOtpDto) {
    const { fullname, phone, password, otp } = input;

    const isPhoneBanned = await this.banService.isPhoneBanned(phone);

    if (isPhoneBanned) throw new AppError("You Are Banned", 403);

    const isUserExists = await this.userService.isUserExistsByPhone(phone);

    if (isUserExists) throw new AppError("A user exists with this info", 400);

    const key = this.getOtpRedisKey(phone);

    const hashedOtp = await this.redisService.get<string>(key);

    if (!hashedOtp) throw new AppError("OTP Expired", 400);

    const isOtpValid = await bcrypt.compare(String(otp), hashedOtp);

    if (!isOtpValid) throw new AppError("Invalid OTP", 400);

    await this.redisService.del(key);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user: IUserDocument = await this.userService.createUser({
      fullname,
      phone,
      password: hashedPassword,
    });

    const userWithoutPassword = user.toObject ? user.toObject() : { ...user };
    delete userWithoutPassword.password;
    return {
      message: "User Registered Successfully",
      data: { user: userWithoutPassword },
    };
  }

  async login(input: LoginDto) {
    const accessToken = jwt.sign(
      { id: input._id },
      configs.auth.accessToken.secret,
      { expiresIn: `${configs.auth.accessToken.expiresIn}s` },
    );

    const refreshToken = jwt.sign(
      { id: input._id },
      configs.auth.refreshToken.secret,
      { expiresIn: `${configs.auth.refreshToken.expiresIn}s` },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await this.redisService.set(
      `refreshToken:${input._id}`,
      hashedRefreshToken,
      Number(configs.auth.refreshToken.expiresIn),
    );

    return {
      message: "User Logged In Successfully",
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async forgotPassword(input: ForgotPasswordDto) {
    const { phone } = input;
    const tokenCooldown = configs.auth.resetToken.cooldown;

    const resetRequestKey = this.getResetRequestKey(phone);
    const genericMessage =
      "If the account exists and not banned, a reset link will be sent";

    const user = await this.userService.findOneByPhone(phone);
    const isPhoneBanned = await this.banService.isPhoneBanned(phone);

    if (!user || isPhoneBanned) {
      throw new AppError(genericMessage, 400);
    }

    const tokenTtlSeconds = tokenCooldown * 60;
    const reserveRequest = await this.redisService.setIfNotExists(
      resetRequestKey,
      1,
      tokenTtlSeconds,
    );

    if (!reserveRequest) {
      throw new AppError("Please wait before requesting again", 429);
    }

    const resetToken: string = uuidv4();
    const hashedResetToken = this.hashResetToken(resetToken);
    const resetTokenKey = this.getResetTokenKey(hashedResetToken);

    try {
      await this.redisService.set(
        resetTokenKey,
        user._id.toString(),
        tokenTtlSeconds,
      );
    } catch {
      await this.redisService.del(resetRequestKey);
      throw new AppError("Failed To Generate reset link", 500);
    }

    const resetLink: string = `${configs.auth.resetPassword.link}${resetToken}`;

    if (configs.app.env === "production") {
      const smsResult = await sendSms(
        phone,
        [{ name: "TOKEN", value: resetLink }],
        configs.sms.patternForgot,
      );

      if (smsResult.status !== 1) {
        await Promise.all([
          this.redisService.del(resetTokenKey),
          this.redisService.del(resetRequestKey),
        ]);
        throw new AppError("Failed To Send Sms", 500);
      }
    }

    return {
      message: "Reset link sent via SMS (Valid for 5 minutes)",
      ...(configs.app.env === "development" && { data: { resetLink } }),
    };
  }

  async resetPassword(input: ResetPasswordDto) {
    const { token, newPassword, confirmPassword } = input;

    if (!/^[0-9a-fA-F-]{36}$/.test(token)) {
      throw new AppError("Invalid reset token", 400);
    }

    const hashedToken = this.hashResetToken(token);
    const resetTokenKey = this.getResetTokenKey(hashedToken);

    const userId = await this.redisService.get<string>(resetTokenKey);

    if (!userId) throw new AppError("Invalid or expired reset token", 400);

    const user = await this.userService.findOneById(userId);

    if (!user) throw new AppError("Invalid or expired reset token", 400);

    const isUserBanned = await this.banService.isPhoneBanned(user.phone);

    if (isUserBanned) throw new AppError("Invalid or expired reset token", 400);

    if (newPassword !== confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userService.changeUserPassword(userId, hashedPassword);

    await Promise.all([
      this.redisService.del(`resetToken:${hashedToken}`),
      this.redisService.del(`resetTokenReq:${user.phone}`),
      this.redisService.del(`refreshToken:${userId}`),
    ]);

    return { message: "Password reset successful" };
  }

  async refreshToken(input: RefreshTokenDto) {
    const { refreshToken } = input;
    const decoded = jwt.verify(
      refreshToken,
      configs.auth.refreshToken.secret,
    ) as jwt.JwtPayload;
    const userId = decoded.id;
    const storedToken = await this.redisService.get<string>(
      `refreshToken:${userId}`,
    );
    if (!storedToken) throw new AppError("Refresh token expired", 403);

    const match = await bcrypt.compare(refreshToken, storedToken);
    if (!match) throw new AppError("Refresh token invalid", 403);

    const accessToken = jwt.sign(
      { id: userId },
      configs.auth.accessToken.secret,
      { expiresIn: `${configs.auth.accessToken.expiresIn}s` },
    );

    return {
      message: "Access token refreshed successfully",
      data: { accessToken },
    };
  }
}
