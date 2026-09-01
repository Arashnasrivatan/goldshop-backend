import { AppError } from "../../common/errors/AppError";
import { IPaginationData } from "../../common/types/utils";
import { createPaginationData } from "../../common/utils";
import { DeleteOrderDto } from "./dto/deleteOrder.dto";
import { GetAllOrdersDto } from "./dto/GetAllOrders.dto";
import { GetMyOrderByIdDto } from "./dto/getMyOrderById.dto";
import { GetMyOrdersDto } from "./dto/getMyOrders.dto";
import { GetOrderByIdDto } from "./dto/getOrderById.dto";
import { UpdateOrderDto } from "./dto/updateOrder.dto";
import OrderRepository from "./order.repository";
import { IOrder, OrderStatus } from "./order.types";

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  private validateOrderStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING_PAYMENT: ["PAID", "CANCELLED"],

      PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],

      PROCESSING: ["SHIPPED", "READY_FOR_PICKUP", "CANCELLED", "REFUNDED"],

      SHIPPED: ["DELIVERED", "REFUNDED"],

      READY_FOR_PICKUP: ["DELIVERED", "CANCELLED", "REFUNDED"],

      DELIVERED: ["REFUNDED"],

      CANCELLED: [],

      REFUNDED: [],
    };

    const allowed = allowedTransitions[currentStatus];

    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Cannot change order status from ${currentStatus} to ${newStatus}`,
        400,
      );
    }
  }

  async getMyOrders(input: GetMyOrdersDto) {
    const { userId, limit, page, sort, status } = input;

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

  async updateOrder(input: UpdateOrderDto) {
    const { orderId, status, adminNote, postTrackingCode } = input;

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const updateData: Partial<IOrder> = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (adminNote !== undefined) {
      updateData.adminNote = adminNote;
    }

    if (postTrackingCode !== undefined) {
      updateData.postTrackingCode = postTrackingCode;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields provided for update", 400);
    }

    if (status && status !== order.status) {
      this.validateOrderStatusTransition(order.status, status);
    }

    const updatedOrder = await this.orderRepository.update(orderId, updateData);

    if (!updatedOrder) {
      throw new AppError("Failed to update order", 500);
    }

    return {
      message: "Order updated successfully",
      data: updatedOrder,
    };
  }

  async deleteOrder(input: DeleteOrderDto) {
    const { orderId, confirmationPhrase } = input;

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.isDeleted) {
      throw new AppError("Order is already deleted", 400);
    }

    const phrase = `DELETE ORDER ${order._id.toString()}`;

    if (confirmationPhrase !== phrase) {
      throw new AppError(
        `Confirmation phrase does not match. To delete this Order, please provide the following confirmation phrase: "${phrase}"`,
        400,
      );
    }

    const deletedOrder = await this.orderRepository.softDelete(orderId);

    if (!deletedOrder) {
      throw new AppError("Failed to delete order", 500);
    }

    return {
      message: "Order deleted successfully",
      data: deletedOrder,
    };
  }
}
