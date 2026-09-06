import { PipelineStage } from "mongoose";
import OrderModel from "../Order/order.model";
import ProductModel from "../Product/product.model";
import UserModel from "../User/user.model";
import {
  DashboardInventoryStatistics,
  DashboardMonthlyStatistic,
  DashboardOrderStatistics,
  DashboardPeriod,
  DashboardSales,
  DashboardUserStatistics,
} from "./dashboard.types";

interface DashboardDates {
  from: Date;
  to: Date;
  monthlyFrom: Date;
}

interface DashboardStatistics {
  sales: DashboardSales;
  orders: DashboardOrderStatistics;
  users: DashboardUserStatistics;
  inventory: DashboardInventoryStatistics;
  monthly: DashboardMonthlyStatistic[];
}

const successfulStatuses = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "READY_FOR_PICKUP",
  "DELIVERED",
] as const;

const profitExpression = {
  $cond: [
    { $eq: ["$items.productSnapshot.type", "JEWELRY"] },
    {
      $round: [
        {
          $multiply: [
            {
              $multiply: [
                {
                  $add: [
                    "$items.priceUsed",
                    {
                      $cond: [
                        {
                          $eq: ["$items.productSnapshot.wageType", "PERCENT"],
                        },
                        {
                          $multiply: [
                            "$items.priceUsed",
                            {
                              $divide: [
                                {
                                  $ifNull: ["$items.productSnapshot.wage", 0],
                                },
                                100,
                              ],
                            },
                          ],
                        },
                        { $ifNull: ["$items.productSnapshot.wage", 0] },
                      ],
                    },
                  ],
                },
                {
                  $divide: [
                    {
                      $ifNull: ["$items.productSnapshot.profitMargin", 0],
                    },
                    100,
                  ],
                },
              ],
            },
            { $ifNull: ["$items.productSnapshot.weight", 0] },
          ],
        },
        -3,
      ],
    },
    {
      $multiply: [
        {
          $cond: [
            {
              $eq: ["$items.productSnapshot.coinProfitType", "PERCENT"],
            },
            {
              $multiply: [
                "$items.priceUsed",
                {
                  $divide: [
                    { $ifNull: ["$items.productSnapshot.coinProfit", 0] },
                    100,
                  ],
                },
              ],
            },
            { $ifNull: ["$items.productSnapshot.coinProfit", 0] },
          ],
        },
        "$items.quantity",
      ],
    },
  ],
};

export class DashboardRepository {
  getPeriodDates(period: DashboardPeriod): DashboardDates {
    const now = new Date();
    const to = new Date(now);
    to.setDate(to.getDate() + 1);
    to.setHours(0, 0, 0, 0);

    const from = new Date(to);
    if (period === "TODAY") from.setDate(from.getDate() - 1);
    if (period === "THIS_WEEK") from.setDate(from.getDate() - 7);
    if (period === "THIS_MONTH") from.setDate(1);
    if (period === "THIS_YEAR") from.setMonth(0, 1);
    if (period === "ALL_TIME") from.setTime(0);

    const monthlyFrom = new Date(to.getFullYear(), to.getMonth() - 11, 1);
    return { from, to, monthlyFrom };
  }

  async getStatistics(dates: DashboardDates): Promise<DashboardStatistics> {
    const [orders, users, inventory] = await Promise.all([
      this.getOrderStatistics(dates),
      this.getUserStatistics(),
      this.getInventoryStatistics(),
    ]);

    return { ...orders, users, inventory };
  }

  private async getOrderStatistics(dates: DashboardDates) {
    const periodMatch = {
      createdAt: { $gte: dates.from, $lt: dates.to },
    };
    const monthlyMatch = {
      createdAt: { $gte: dates.monthlyFrom, $lt: dates.to },
    };
    const baseMatch = { isDeleted: { $ne: true } };
    const successfulMatch = { status: { $in: successfulStatuses } };

    const [result] = await OrderModel.aggregate<{
      sales: Array<{ sales: number; orders: number }>;
      profit: Array<{ profit: number }>;
      orderStats: Array<Record<string, number>>;
      monthlySales: Array<{ _id: string; sales: number }>;
      monthlyProfit: Array<{ _id: string; profit: number }>;
    }>([
      { $match: baseMatch },
      {
        $facet: {
          sales: [
            { $match: successfulMatch },
            { $match: periodMatch },
            {
              $group: {
                _id: null,
                sales: { $sum: "$total" },
                orders: { $sum: 1 },
              },
            },
          ],
          profit: [
            { $match: successfulMatch },
            { $match: periodMatch },
            { $unwind: "$items" },
            { $project: { profit: profitExpression } },
            { $group: { _id: null, profit: { $sum: "$profit" } } },
          ],
          orderStats: [
            { $match: periodMatch },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                paid: { $sum: { $cond: [{ $eq: ["$status", "PAID"] }, 1, 0] } },
                processing: {
                  $sum: { $cond: [{ $eq: ["$status", "PROCESSING"] }, 1, 0] },
                },
                shipped: {
                  $sum: { $cond: [{ $eq: ["$status", "SHIPPED"] }, 1, 0] },
                },
                readyForPickup: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "READY_FOR_PICKUP"] }, 1, 0],
                  },
                },
                delivered: {
                  $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] },
                },
                cancelled: {
                  $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
                },
                refunded: {
                  $sum: { $cond: [{ $eq: ["$status", "REFUNDED"] }, 1, 0] },
                },
              },
            },
          ],
          monthlySales: [
            { $match: successfulMatch },
            { $match: monthlyMatch },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
                sales: { $sum: "$total" },
              },
            },
          ],
          monthlyProfit: [
            { $match: successfulMatch },
            { $match: monthlyMatch },
            { $unwind: "$items" },
            {
              $project: {
                month: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" },
                },
                profit: profitExpression,
              },
            },
            {
              $group: {
                _id: "$month",
                profit: { $sum: "$profit" },
              },
            },
          ],
        },
      },
    ] as PipelineStage[]);

    const sales = result?.sales[0] ?? { sales: 0, orders: 0 };
    const profit = result?.profit[0]?.profit ?? 0;
    const stats = result?.orderStats[0] ?? {};
    const monthlySales = new Map(
      (result?.monthlySales ?? []).map((item) => [item._id, item.sales]),
    );
    const monthlyProfit = new Map(
      (result?.monthlyProfit ?? []).map((item) => [item._id, item.profit]),
    );
    const months = new Set([...monthlySales.keys(), ...monthlyProfit.keys()]);

    return {
      sales: { sales: sales.sales, profit, orders: sales.orders },
      orders: {
        total: stats.total ?? 0,
        paid: stats.paid ?? 0,
        processing: stats.processing ?? 0,
        shipped: stats.shipped ?? 0,
        readyForPickup: stats.readyForPickup ?? 0,
        delivered: stats.delivered ?? 0,
        cancelled: stats.cancelled ?? 0,
        refunded: stats.refunded ?? 0,
      },
      monthly: [...months].sort().map((month) => ({
        month,
        sales: monthlySales.get(month) ?? 0,
        profit: monthlyProfit.get(month) ?? 0,
      })),
    };
  }

  private async getUserStatistics(): Promise<DashboardUserStatistics> {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const month = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, newToday, newThisMonth] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ createdAt: { $gte: today } }),
      UserModel.countDocuments({ createdAt: { $gte: month } }),
    ]);

    return { total, newToday, newThisMonth };
  }

  private async getInventoryStatistics(): Promise<DashboardInventoryStatistics> {
    const [result] = await ProductModel.aggregate<{
      totalProducts: number;
      activeProducts: number;
      inactiveProducts: number;
      outOfStockProducts: number;
      totalQuantity: number;
    }>([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          inactiveProducts: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
          },
          totalQuantity: { $sum: "$stock" },
        },
      },
    ]);

    return {
      totalProducts: result?.totalProducts ?? 0,
      activeProducts: result?.activeProducts ?? 0,
      inactiveProducts: result?.inactiveProducts ?? 0,
      outOfStockProducts: result?.outOfStockProducts ?? 0,
      totalQuantity: result?.totalQuantity ?? 0,
    };
  }
}
