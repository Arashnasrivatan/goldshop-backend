import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";
import { OrderStatus } from "./order.types";
import { IUserDocument } from "../User/user.model";
import { GetMyOrdersDto } from "./dto/getMyOrders.dto";
import response from "../../common/utils/response";
import { GetMyOrderByIdDto } from "./dto/getMyOrderById.dto";

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.user as IUserDocument;

      const userId = userData._id.toString();

      const { page, limit, sort, status } = req.query as {
        page?: string;
        limit?: string;
        sort?: "asc" | "desc";
        status?: OrderStatus;
      };

      const input: GetMyOrdersDto = new GetMyOrdersDto({
        userId,
        page,
        limit,
        sort,
        status,
      });

      const result = await this.orderService.getMyOrders(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getMyOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.user as IUserDocument;

      const { orderId } = req.params as { orderId: string };

      const input = new GetMyOrderByIdDto({
        userId: userData._id.toString(),
        orderId,
      });

      const result = await this.orderService.getMyOrderById(input);

      return response(res, 200, result.message, result.data);
    } catch (err) {
      next(err);
    }
  };

  getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };
}
