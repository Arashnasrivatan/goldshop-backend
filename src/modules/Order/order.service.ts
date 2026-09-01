import { AppError } from "../../common/errors/AppError";
import { IPaginationData } from "../../common/types/utils";
import { createPaginationData } from "../../common/utils";
import { GetAllOrdersDto } from "./dto/GetAllOrders.dto";
import { GetMyOrderByIdDto } from "./dto/getMyOrderById.dto";
import { GetMyOrdersDto } from "./dto/getMyOrders.dto";
import { GetOrderByIdDto } from "./dto/getOrderById.dto";
import OrderRepository from "./order.repository";

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async getMyOrders(input: GetMyOrdersDto) {
    const userId = input.userId;
    const limit = Number(input?.limit ?? 10);
    const page = Number(input?.page ?? 1);
    const sort = input?.sort ?? "desc";
    const status = input?.status;

    const orders = await this.orderRepository.findByUserId(
      userId,
      limit,
      page,
      sort,
      status,
    );

    const pagination: IPaginationData = createPaginationData(
      page,
      limit,
      orders.meta.total,
      "Order",
    );

    const data = {
      pagination,
      orders: orders.data,
    };

    return {
      message: "Orders retrieved successfully",
      data,
    };
  }

  async getMyOrderById(input: GetMyOrderByIdDto) {
    const { userId, orderId } = input;

    const order = await this.orderRepository.findByIdForUser(orderId, userId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return {
      message: "Order retrieved successfully",
      data: order,
    };
  }

  async getAllOrders(input: GetAllOrdersDto) {
    const {
      search,
      userId,
      status,
      paymentAuthority,
      postTrackingCode,
      from,
      to,
      includeDeleted,
      limit,
      page,
      sort,
    } = input;

    const orders = await this.orderRepository.findAll(
      {
        search,
        userId,
        status,
        paymentAuthority,
        postTrackingCode,
        from,
        to,
        includeDeleted,
      },
      limit,
      page,
      sort,
    );

    const pagination: IPaginationData = createPaginationData(
      page,
      limit,
      orders.meta.total,
      "Order",
    );

    const data = { pagination, orders: orders.data };

    return {
      message: "Orders retrieved successfully",
      data,
    };
  }

  async getOrderById(input: GetOrderByIdDto) {
    const { orderId } = input;

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return {
      message: "Order retrieved successfully",
      data: order,
    };
  }
}
