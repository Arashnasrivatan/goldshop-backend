import mongoose, { Schema, Document, Model } from "mongoose";
import { ICheckout, ICheckoutAddress } from "./checkout.types";

export interface ICheckoutDocument extends ICheckout, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ProductSnapshotSchema = new Schema(
  {
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
  { _id: false },
);

const CheckoutItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    productSnapshot: {
      type: ProductSnapshotSchema,
      required: true,
    },
    priceUsed: { type: Number, required: true },
    priceSnapshotAt: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
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
    type: {
      type: String,
      enum: ["PICKUP", "SHIPPING"],
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const CheckoutAddressSchema = new Schema<ICheckoutAddress>(
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

const PaymentSchema = new Schema(
  {
    authority: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["RIAL"],
      required: true,
      default: "RIAL",
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const CheckoutSchema = new Schema<ICheckoutDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [CheckoutItemSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) =>
          Array.isArray(value) && value.length > 0,
        message: "Checkout must contain at least one item",
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
      enum: ["PENDING", "PAID"],
      default: "PENDING",
      index: true,
    },
    payment: {
      type: PaymentSchema,
      required: true,
    },
    shippingAddress: {
      type: CheckoutAddressSchema,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

CheckoutSchema.index({ user: 1, status: 1, createdAt: -1 });
CheckoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CheckoutModel: Model<ICheckoutDocument> =
  mongoose.model<ICheckoutDocument>("Checkout", CheckoutSchema);

export default CheckoutModel;
