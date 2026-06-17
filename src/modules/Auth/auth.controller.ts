import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import response from "../../common/utils/response";
import { SendOtpDto } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

export class AuthController {
  constructor(private authService: AuthService) {}

  //* ========== Authentication Management ========== *\\

  sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: SendOtpDto = new SendOtpDto(req.body);
      const result = await this.authService.sendOTP(input);

      return response(res, 200, result.message, { otpCode: result?.otpCode });
    } catch (err) {
      next(err);
    }
  };

  verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: VerifyOtpDto = new VerifyOtpDto(req.body);
      const result = await this.authService.verifyOTP(input);

      return response(res, 201, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
}
