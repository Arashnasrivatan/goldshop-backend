import { Request, Response, NextFunction } from "express";
import response from "../../common/utils/response";
import { BanService } from "./ban.service";
import { IUserDocument } from "../User/user.model";
import { BanUserDto } from "./dto/banUser.dto";

export class BanController {
  constructor(private banService: BanService) {}

  //* ========== Ban Management ========== *\\

  getAllBans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  getBannedUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  ban = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req.user as IUserDocument;
      if (!userReq) {
        return response(res, 401, "Unauthorized: Please login");
      }
      const adminId = userReq._id.toString();
      const { userId, banReason } = req.body as {
        userId: string;
        banReason: string;
      };

      const input: BanUserDto = new BanUserDto({ userId, banReason, adminId });

      const result = await this.banService.banUser(input);

      return response(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  };

  unban = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
}
