import { Request, Response, NextFunction } from "express";
import response from "../../common/utils/response";
import { BanService } from "./ban.service";
import { IUserDocument } from "../User/user.model";
import { BanUserDto } from "./dto/banUser.dto";
import { GetAllBansDto } from "./dto/getAllBans.dto";
import { GetBanDto } from "./dto/getBan.dto";

export class BanController {
  constructor(private banService: BanService) {}

  //* ========== Ban Management ========== *\\

  getAllBans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = req.query;
      const input: GetAllBansDto = new GetAllBansDto({
        search: queryParams.search as string,
        phone: queryParams.phone as string,
        userId: queryParams.userId as string,
        bannedBy: queryParams.bannedBy as string,
        banReason: queryParams.banReason as string,
        from: queryParams.from as string,
        to: queryParams.to as string,
        sort: queryParams.sort as string,
        limit: queryParams.limit
          ? parseInt(queryParams.limit as string, 10)
          : 10,
        page: queryParams.page ? parseInt(queryParams.page as string, 10) : 1,
      });

      const result = await this.banService.getAllBans(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getBanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { banId } = req.params as { banId: string };

      const input: GetBanDto = new GetBanDto({ banId });

      const result = await this.banService.getBan(input);

      return response(res, 200, result.message, result.data);
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

  editBan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
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
