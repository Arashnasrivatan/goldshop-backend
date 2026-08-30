import mongoose, { Schema, Document, Model } from "mongoose";
import { IOrder, IOrderAddress } from "./order.types";

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      // Not required because the Product may be hard-deleted after the order is created
    },
    productSnapshot: {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      image: {
        type: {
          url: { type: String, required: true },
          key: { type: String, required: true },
        },
        default: null,
      },
      type: {
        type: String,
        enum: ["JEWELRY", "COIN"],
        required: true,
      },
      weight: { type: Number, default: null },
      wage: { type: Number, default: null },
      wageType: {
        type: String,
        enum: ["PERCENT", "FIXED"],
        default: null,
      },
      profitMargin: { type: Number, default: null },
      taxRate: { type: Number, default: null },
      coinType: {
        type: String,
        enum: ["EMAMI", "BAHAR_AZADI", "HALF", "QUARTER", "GRAM"],
        default: null,
      },
      coinProfit: { type: Number, default: null },
      coinProfitType: {
        type: String,
        enum: ["PERCENT", "FIXED"],
        default: null,
      },
    },
    priceUsed: { type: Number, required: true },
    priceSnapshotAt: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { _id: false },
);

const ShippingSnapshotSchema = new Schema(
  {
    method: {
      type: Schema.Types.ObjectId,
      ref: "ShippingMethod",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    addressId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    postalCode: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      formatedLocation: { type: String, default: null },
    },
    address: { type: String, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) =>
          Array.isArray(value) && value.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shipping: {
      type: ShippingSnapshotSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "READY_FOR_PICKUP",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PENDING_PAYMENT",
      index: true,
    },
    payment: {
      authority: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
    shippingAddress: {
      type: OrderAddressSchema,
      required: true,
    },
    postTrackingCode: {
      type: String,
      default: null,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    adminNote: { type: String, default: null },
  },
  { timestamps: true },
);

OrderSchema.index({ user: 1, createdAt: -1 });

const OrderModel: Model<IOrderDocument> = mongoose.model<IOrderDocument>(
  "Order",
  OrderSchema,
);

export default OrderModel;
