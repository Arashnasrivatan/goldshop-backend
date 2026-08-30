/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import OrderModel, { IOrderDocument } from "./order.model";
import { IOrder, OrderStatus } from "./order.types";

export interface IOrderFilter {
  search?: string;
  userId?: string;
  status?: OrderStatus | string;
  from?: string;
  to?: string;
  includeDeleted?: boolean;
  paymentAuthority?: string;
  postTrackingCode?: string;
}

export class OrderRepository {
  async create(input: Partial<IOrder>): Promise<IOrderDocument> {
    const order = await OrderModel.create({
      ...input,
      user: input.user,
      items: input.items,
      shipping: input.shipping,
      subtotal: Number(input.subtotal ?? 0),
      shippingCost: Number(input.shippingCost ?? 0),
      total: Number(input.total ?? 0),
      status: input.status ?? "PENDING_PAYMENT",
      payment: {
        authority: input.payment?.authority ?? null,
        paidAt: input.payment?.paidAt ?? null,
      },
      shippingAddress: input.shippingAddress,
      postTrackingCode: input.postTrackingCode ?? null,
      isDeleted: Boolean(input.isDeleted ?? false),
      adminNote: input.adminNote ?? null,
    });

    return order;
  }

  async findById(orderId: string): Promise<IOrderDocument | null> {
    return OrderModel.findById(orderId)
      .populate("user", "fullname phone role")
      .lean()
      .exec() as Promise<IOrderDocument | null>;
  }

  async findByIdForUser(
    orderId: string,
    userId: string,
  ): Promise<IOrderDocument | null> {
    return OrderModel.findOne({
      _id: new Types.ObjectId(orderId),
      user: new Types.ObjectId(userId),
      isDeleted: { $ne: true },
    })
      .populate("user", "fullname phone role")
      .lean()
      .exec() as Promise<IOrderDocument | null>;
  }

  async findByUserId(
    userId: string,
    limit: number = 10,
    page: number = 1,
    sort: string = "desc",
    status?: OrderStatus | string,
    includeDeleted: boolean = false,
  ) {
    const sortOrder = sort === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      user: new Types.ObjectId(userId),
    };

    if (status) {
      query.status = status;
    }

    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    const [data, total] = await Promise.all([
      OrderModel.find(query)
        .populate("user", "fullname phone role")
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      OrderModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(
    filters: IOrderFilter = {},
    limit: number = 10,
    page: number = 1,
    sort: string = "desc",
  ) {
    const sortOrder = sort === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (filters.search?.trim()) {
      const search = filters.search.trim();

      query.$or = [
        {
          "shippingAddress.address": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "shippingAddress.title": {
            $regex: search,
            $options: "i",
          },
        },
        {
          adminNote: {
            $regex: search,
            $options: "i",
          },
        },
        {
          postTrackingCode: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "payment.authority": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (filters.userId) {
      query.user = new Types.ObjectId(filters.userId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentAuthority) {
      query["payment.authority"] = {
        $regex: filters.paymentAuthority,
        $options: "i",
      };
    }

    if (filters.postTrackingCode) {
      query.postTrackingCode = {
        $regex: filters.postTrackingCode,
        $options: "i",
      };
    }

    if (filters.from || filters.to) {
      query.createdAt = {};

      if (filters.from) {
        query.createdAt.$gte = new Date(filters.from);
      }

      if (filters.to) {
        query.createdAt.$lte = new Date(filters.to);
      }
    }

    if (!filters.includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    const [data, total] = await Promise.all([
      OrderModel.find(query)
        .populate("user", "fullname phone role")
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      OrderModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    userId?: string,
  ): Promise<IOrderDocument | null> {
    const query: Record<string, any> = {
      _id: new Types.ObjectId(orderId),
      isDeleted: { $ne: true },
    };

    if (userId) {
      query.user = new Types.ObjectId(userId);
    }

    return OrderModel.findOneAndUpdate(
      query,
      {
        $set: {
          status,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec() as Promise<IOrderDocument | null>;
  }

  async update(
    orderId: string,
    updateData: Partial<IOrder>,
    userId?: string,
  ): Promise<IOrderDocument | null> {
    const query: Record<string, any> = {
      _id: new Types.ObjectId(orderId),
      isDeleted: { $ne: true },
    };

    if (userId) {
      query.user = new Types.ObjectId(userId);
    }

    const safeUpdate: Record<string, unknown> = {};

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        safeUpdate[key] = value;
      }
    });

    if (Object.keys(safeUpdate).length === 0) {
      return null;
    }

    return OrderModel.findOneAndUpdate(
      query,
      {
        $set: safeUpdate,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec() as Promise<IOrderDocument | null>;
  }

  async softDelete(orderId: string): Promise<IOrderDocument | null> {
    return OrderModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(orderId),
        isDeleted: { $ne: true },
      },
      {
        $set: {
          isDeleted: true,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec() as Promise<IOrderDocument | null>;
  }
}

export default OrderRepository;
