import CheckoutModel, { ICheckoutDocument } from "./checkout.model";
import { ICheckout } from "./checkout.types";
import { ClientSession, Types } from "mongoose";

export class CheckoutRepository {
  async create(
    data: Omit<ICheckout, "_id" | "createdAt" | "updatedAt">,
    session?: ClientSession,
  ): Promise<ICheckoutDocument> {
    const checkout = new CheckoutModel(data);
    await checkout.save({ session });
    return checkout;
  }

  async countPendingByCoupon(
    couponId: string,
    userId?: string,
    session?: ClientSession,
  ): Promise<number> {
    return CheckoutModel.countDocuments({
      "coupon.id": new Types.ObjectId(couponId),
      status: "PENDING",
      expiresAt: { $gt: new Date() },
      ...(userId ? { user: new Types.ObjectId(userId) } : {}),
    }).session(session ?? null);
  }

  async deleteUnpaidByUserId(userId: string): Promise<void> {
    await CheckoutModel.deleteMany({
      user: new Types.ObjectId(userId),
      status: { $in: ["PENDING", "EXPIRED"] },
    });
  }

  async findByTrackIdForUser(
    trackId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<ICheckoutDocument | null> {
    return CheckoutModel.findOne({
      "payment.trackId": trackId,
      user: new Types.ObjectId(userId),
    })
      .session(session ?? null)
      .exec();
  }

  async markAsPaid(
    checkoutId: string,
    orderId: Types.ObjectId,
    paidAt: Date,
    session: ClientSession,
  ): Promise<ICheckoutDocument | null> {
    return CheckoutModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(checkoutId),
        status: "PENDING",
      },
      {
        $set: {
          status: "PAID",
          orderId,
          "payment.paidAt": paidAt,
        },
      },
      { new: true, runValidators: true, session },
    ).exec();
  }

  async markAsExpired(
    checkoutId: string,
    session?: ClientSession,
  ): Promise<ICheckoutDocument | null> {
    return CheckoutModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(checkoutId),
        status: "PENDING",
      },
      {
        $set: {
          status: "EXPIRED",
        },
      },
      { new: true, runValidators: true, ...(session && { session }) },
    ).exec();
  }

  async markExpired(expirationTime: Date): Promise<number> {
    const result = await CheckoutModel.updateMany(
      {
        status: "PENDING",
        createdAt: { $lte: expirationTime },
      },
      {
        $set: {
          status: "EXPIRED",
        },
      },
    );

    return result.modifiedCount;
  }
}
