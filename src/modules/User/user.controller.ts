import { NextFunction, Request, Response } from "express";

import { AdminUserDeleteDto } from "./dto/adminUserDelete.dto";
import { AdminUserUpdateDto } from "./dto/adminUserUpdate.dto";
import { GetAllUsersDto } from "./dto/getAllUsers.dto";
import { IUserDocument } from "./user.model";
import { UserIdDto } from "../../common/dto/userId.dto";
import { UserService } from "./user.service";
import response from "../../common/utils/response";

export class UserController {
  constructor(private userService: UserService) {}

  //* ========== Admin User Management ========== *\\

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = req.query;
      const includeBannedParam = queryParams.includeBanned as
        | string
        | undefined;
      const includeBanned = includeBannedParam === "true";

      const input: GetAllUsersDto = new GetAllUsersDto({
        search: queryParams.search as string,
        userId: queryParams.userId as string,
        phone: queryParams.phone as string,
        from: queryParams.from as string,
        to: queryParams.to as string,
        role: queryParams.role as string,
        includeBanned,
        sort: queryParams.sort as string,
        limit: queryParams.limit
          ? parseInt(queryParams.limit as string, 10)
          : 10,
        page: queryParams.page ? parseInt(queryParams.page as string, 10) : 1,
      });

      const result = await this.userService.getAllUsers(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string };

      const input: UserIdDto = new UserIdDto({ userId });

      const result = await this.userService.getOneUser(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminData = req.user as IUserDocument;
      const { userId } = req.params as { userId: string };
      const { fullname } = req.body as { fullname?: string };

      const input = new AdminUserUpdateDto({
        userId,
        fullname,
        adminRole: adminData.role,
      });

      const result = await this.userService.adminUserUpdate(input);
      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminData = req.user as IUserDocument;
      const { userId } = req.params as { userId: string };
      const { confirmationPhrase } = req.body as { confirmationPhrase: string };

      const input: AdminUserDeleteDto = new AdminUserDeleteDto({
        userId,
        confirmationPhrase,
        adminRole: adminData.role,
      });

      const result = await this.userService.adminDeleteUser(input);

      return response(res, 200, result.message);
    } catch (err) {
      next(err);
    }
  };

  //* ========== Admin Address Management ========== *\\

  adminAddUserAddress = async (
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
  adminUpdateUserAddress = async (
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
  adminDeleteUserAddress = async (
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

  //* ========== Admin User Role Management ========== *\\

  promoteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
  demoteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  //* ========== User Management ========== *\\

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
  deleteMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  //* ========== User Address Management ========== *\\

  addMyAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
  updateMyAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
  deleteMyAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
}
