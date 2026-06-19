import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import response from "../../common/utils/response";
import configs from "./../../configs/env.config";
import { SendOtpDto } from "./dto/sendOTP.dto";
import { VerifyOtpDto } from "./dto/verifyOTP.dto";
import { IUserDocument } from "../User/user.model";
import { LoginDto } from "./dto/login.dto";

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
      const user = req.user as IUserDocument;
      const userId = user._id.toString();
      if (!user || !userId) {
        return response(res, 401, "Unauthorized: Please login");
      }

      const input: LoginDto = new LoginDto({ _id: userId });

      const result = await this.authService.login(input);

      res.cookie("refresh_token", result.data.refreshToken, {
        httpOnly: true,
        secure: configs.app.env === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: configs.auth.refreshToken.expiresIn * 1000,
      });

      return response(res, 200, "User Logged In Successfully", {
        accessToken: result.data.accessToken,
        user: {
          id: user._id,
          fullname: user.fullname,
          phone: user.phone,
          role: user.role,
        },
      });
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
