import { Request, Response, NextFunction } from "express";
import response from "./../../common/utils/response";
import { IUserDocument } from "../../modules/User/user.model";

const roleGuard = (...roles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    const user = req.user as IUserDocument;
    if (!user) {
      return response(res, 401, "Unauthorized: Please login");
    }
    const hasRole: boolean = roles.includes(user.role);

    if (!hasRole) {
      return response(res, 403, "Forbidden");
    }
    next();
  };
};

export default roleGuard;
