import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
    } catch (err) {
      next(err);
    }
  };

  getMyOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO
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
