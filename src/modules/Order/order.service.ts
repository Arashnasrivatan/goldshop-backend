import { AppError } from "../../common/errors/AppError";
import { IPaginationData } from "../../common/types/utils";
import { createPaginationData } from "../../common/utils";
import { GetMyOrdersDto } from "./dto/getMyOrders.dto";
import OrderRepository from "./order.repository";

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async getMyOrders(input: GetMyOrdersDto) {
    const userId = input.userId;
    const limit = Number(input?.limit ?? 10);
    const page = Number(input?.page ?? 1);
    const sort = input?.sort ?? "desc";
    const status = input?.status;

    const result = await this.orderRepository.findByUserId(
      userId,
      limit,
      page,
      sort,
      status,
    );

    const pagination: IPaginationData = await createPaginationData(
      page,
      limit,
      result.meta.total,
      "Order",
    );

    const data = {
      pagination,
      orders: result.data,
    };

    return {
      message: "Orders retrieved successfully",
      data,
    };
  }
}
