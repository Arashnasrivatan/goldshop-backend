import {
  createPayment,
  verifyPayment,
} from "../../common/services/payment.service";
import { AppError } from "../../common/errors/AppError";
import { calculateProductPrice } from "../../common/utils";
import { CartRepository } from "../Cart/cart.repository";
import { OrderRepository } from "../Order/order.repository";
import { PriceRepository } from "../Price/price.repository";
import { PriceStatusService } from "../Price/priceStatus.service";
import { ProductRepository } from "../Product/product.repository";
import { ShippingRepository } from "../Shipping/shipping.repository";
import { UserRepository } from "../User/user.repository";
import { CheckoutRepository } from "./checkout.repository";
import { ICheckout, ICheckoutAddress, ICheckoutItem } from "./checkout.types";
import mongoose, { Types } from "mongoose";
import { CreateCheckoutDto } from "./dto/createCheckout.dto";
import { VerifyCheckoutDto } from "./dto/verifyCheckout.dto";
import { smsService } from "../../common/services/sms.service";
import configs from "../../configs/env.config";
import logger from "../../common/utils/logger";

export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly cartRepository: CartRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly shippingRepository: ShippingRepository,
    private readonly userRepository: UserRepository,
    private readonly priceRepository: PriceRepository,
  ) {}

  async createCheckout(input: CreateCheckoutDto): Promise<{
    message: string;
    data: { checkout: ICheckout; paymentUrl: string };
  }> {
    const priceStatus = PriceStatusService.isPriceDisplayAllowed();
    if (!priceStatus.allowed) {
      throw new AppError(
        priceStatus.message ?? "Current pricing is unavailable.",
        503,
      );
    }

    const [cart, shippingMethod, user, prices] = await Promise.all([
      this.cartRepository.findRawByUserId(input.userId),
      this.shippingRepository.findById(input.shippingMethodId),
      this.userRepository.findById(input.userId),
      this.priceRepository.findLatest(),
    ]);

    if (!cart) throw new AppError("Cart not found.", 404);
    if (cart.items.length === 0) {
      throw new AppError("Cart must contain at least one item.", 400);
    }
    if (!user) throw new AppError("User not found.", 404);
    if (user.isBanned) throw new AppError("Banned users cannot checkout.", 403); // Double check
    if (!prices)
      throw new AppError("Current market price is unavailable.", 503);
    if (!shippingMethod) throw new AppError("Shipping method not found.", 404);
    if (!shippingMethod.isActive) {
      throw new AppError("Selected shipping method is inactive.", 400);
    }
    if (
      shippingMethod.type !== "PICKUP" &&
      shippingMethod.type !== "SHIPPING"
    ) {
      throw new AppError("Selected shipping method has an invalid type.", 400);
    }

    const isPickup = shippingMethod.type === "PICKUP";
    if (isPickup && input.addressId) {
      throw new AppError("An address cannot be used for pickup.", 400);
    }
    if (!isPickup && !input.addressId) {
      throw new AppError("An address is required for shipping.", 400);
    }

    let shippingAddress: ICheckoutAddress | null = null;
    if (!isPickup && input.addressId) {
      const address = user.addresses.find(
        (candidate) => candidate._id.toString() === input.addressId,
      );
      if (!address) throw new AppError("Address not found.", 404);

      shippingAddress = {
        addressId: new Types.ObjectId(address._id),
        title: address.title,
        postalCode: address.postalCode,
        location: {
          lat: address.location.lat,
          lng: address.location.lng,
          formatedLocation: address.location.formatedLocation ?? null,
        },
        address: address.address,
      };
    }

    const priceSnapshotAt = prices.createdAt;
    const items: ICheckoutItem[] = [];
    for (const cartItem of cart.items) {
      if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
        throw new AppError("Cart item quantity must be at least 1.", 400);
      }

      const product = await this.productRepository.findById(
        cartItem.productId.toString(),
      );
      if (!product)
        throw new AppError("A product in the cart was not found.", 404);
      if (product.isDeleted)
        throw new AppError("A product in the cart was deleted.", 404);
      if (!product.isActive)
        throw new AppError("A product in the cart is inactive.", 400);
      if (!Number.isFinite(product.stock) || product.stock <= 0) {
        throw new AppError("A product in the cart is out of stock.", 409);
      }
      if (cartItem.quantity > product.stock) {
        throw new AppError("A product does not have sufficient stock.", 409);
      }

      const calculation = calculateProductPrice(product, prices);
      const unitPrice = calculation.roundedPrice;
      const totalPrice = unitPrice * cartItem.quantity;
      if (
        !Number.isFinite(unitPrice) ||
        unitPrice < 0 ||
        !Number.isFinite(totalPrice) ||
        totalPrice < 0
      ) {
        throw new AppError("A product has an invalid calculated price.", 503);
      }

      let priceUsed: number;
      if (product.type === "JEWELRY") {
        priceUsed = prices.gold18k;
      } else {
        switch (product.coinType) {
          case "EMAMI":
            priceUsed = prices.coinEmami;
            break;
          case "BAHAR_AZADI":
            priceUsed = prices.coinFull;
            break;
          case "HALF":
            priceUsed = prices.coinHalf;
            break;
          case "QUARTER":
            priceUsed = prices.coinQuarter;
            break;
          default:
            throw new AppError(
              "A cart coin has no supported market price.",
              503,
            );
        }
      }
      if (!Number.isFinite(priceUsed) || priceUsed < 0) {
        throw new AppError("A product has an invalid market price.", 503);
      }

      items.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          image: product.images[0] ?? null,
          type: product.type,
          weight: product.weight ?? null,
          wage: product.wage ?? null,
          wageType: product.wageType ?? null,
          profitMargin: product.profitMargin ?? null,
          taxRate: product.taxRate ?? null,
          coinType: product.coinType ?? null,
          coinProfit: product.coinProfit ?? null,
          coinProfitType: product.coinProfitType ?? null,
        },
        priceUsed,
        priceSnapshotAt,
        quantity: cartItem.quantity,
        unitPrice,
        totalPrice,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingCost = shippingMethod.price;
    const total = subtotal + shippingCost;
    if (
      !Number.isFinite(subtotal) ||
      subtotal < 0 ||
      !Number.isFinite(shippingCost) ||
      shippingCost < 0 ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      throw new AppError("Checkout total is invalid.", 400);
    }

    if (total > 400000000) {
      throw new AppError(
        "Checkout total exceeds 400 million Toman you can contact support",
        400,
      );
    } // 400 million Toman

    const amountInRial = Math.round(total * 10);
    let payment;
    try {
      payment = await createPayment({ amountInToman: total });
    } catch {
      throw new AppError("Payment service is unavailable.", 502);
    }

    const checkout = await this.checkoutRepository.create({
      user: user._id,
      items,
      shipping: {
        method: shippingMethod._id,
        type: isPickup ? "PICKUP" : "SHIPPING",
        name: shippingMethod.name,
        price: shippingCost,
      },
      shippingAddress,
      subtotal,
      shippingCost,
      total,
      status: "PENDING",
      payment: {
        trackId: payment.trackId,
        amount: amountInRial,
        currency: "RIAL",
        createdAt: new Date(),
        paidAt: null,
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return {
      message: "Checkout created successfully",
      data: { checkout, paymentUrl: payment.paymentUrl },
    };
  }

  async verifyCheckout(input: VerifyCheckoutDto) {
    const checkout = await this.checkoutRepository.findByTrackIdForUser(
      input.trackId,
      input.userId,
    );
    if (!checkout) throw new AppError("Checkout not found.", 404);

    if (checkout.status === "PAID") {
      const order = checkout.orderId
        ? await this.orderRepository.findById(checkout.orderId.toString())
        : await this.orderRepository.findByCheckoutId(checkout._id.toString());
      if (!order)
        throw new AppError("Checkout has an invalid paid state.", 500);
      return { message: "Checkout was already verified.", data: order };
    }

    if (new Date() > checkout.expiresAt) {
      await this.checkoutRepository.markAsExpired(checkout._id.toString());
      throw new AppError("Checkout has expired.", 409);
    }

    let verification;
    try {
      verification = await verifyPayment({ trackId: input.trackId });
    } catch {
      throw new AppError("Payment service is unavailable.", 502);
    }

    if (verification.result !== 100) {
      throw new AppError("Payment was not successful.", 400);
    }
    if (!Number.isFinite(verification.amount)) {
      throw new AppError(
        "Payment verification returned an invalid amount.",
        409,
      );
    }
    if (verification.amount !== checkout.payment.amount) {
      throw new AppError(
        "Verified payment amount does not match checkout.",
        409,
      );
    }

    const paidAt = verification.paidAt
      ? new Date(verification.paidAt)
      : new Date();
    if (!Number.isFinite(paidAt.getTime())) {
      throw new AppError("Payment verification returned an invalid date.", 409);
    }

    const session = await mongoose.startSession();
    try {
      const createdOrder = await session.withTransaction(
        async (): Promise<Awaited<ReturnType<OrderRepository["create"]>>> => {
          const currentCheckout =
            await this.checkoutRepository.findByTrackIdForUser(
              input.trackId,
              input.userId,
              session,
            );
          if (!currentCheckout) throw new AppError("Checkout not found.", 404);

          if (currentCheckout.status === "PAID") {
            const existingOrder = currentCheckout.orderId
              ? await this.orderRepository.findById(
                  currentCheckout.orderId.toString(),
                )
              : await this.orderRepository.findByCheckoutId(
                  currentCheckout._id.toString(),
                  session,
                );
            if (!existingOrder) {
              throw new AppError("Checkout has an invalid paid state.", 500);
            }
            return existingOrder;
          }

          if (new Date() > currentCheckout.expiresAt) {
            throw new AppError("Checkout has expired.", 409);
          }

          for (const item of currentCheckout.items) {
            if (
              !item.product ||
              !Number.isInteger(item.quantity) ||
              item.quantity < 1
            ) {
              throw new AppError("Checkout contains an invalid item.", 500);
            }

            const product =
              await this.productRepository.decrementStockIfAvailable(
                item.product.toString(),
                item.quantity,
                session,
              );
            if (!product) {
              throw new AppError(
                "A product is unavailable or has insufficient stock.",
                409,
              );
            }
          }

          const transactionOrder = await this.orderRepository.create(
            {
              checkoutId: currentCheckout._id,
              user: currentCheckout.user,
              items: currentCheckout.items,
              shipping: currentCheckout.shipping,
              shippingAddress: currentCheckout.shippingAddress ?? null,
              subtotal: currentCheckout.subtotal,
              shippingCost: currentCheckout.shippingCost,
              total: currentCheckout.total,
              status: "PAID",
              payment: {
                trackId: currentCheckout.payment.trackId,
                paidAt,
              },
            },
            session,
          );

          const clearedCart = await this.cartRepository.clearByUserId(
            input.userId,
            session,
          );
          if (!clearedCart) throw new AppError("Cart not found.", 404);

          const markedCheckout = await this.checkoutRepository.markAsPaid(
            currentCheckout._id.toString(),
            transactionOrder._id,
            paidAt,
            session,
          );
          if (!markedCheckout) {
            throw new AppError("Checkout was already verified.", 409);
          }

          return transactionOrder;
        },
      );

      if (!createdOrder) throw new AppError("Order creation failed.", 500);

      const order = await this.orderRepository.findById(
        createdOrder._id.toString(),
      );

      if (!order) {
        throw new AppError("Created order could not be retrieved.", 500);
      }

      const buyer = await this.userRepository.findById(
        createdOrder.user.toString(),
      );

      if (!buyer) {
        logger.error(
          `Order ${createdOrder._id} was created but buyer could not be found.`,
        );
      }

      // Send SMS to buyer
      if (buyer) {
        try {
          const buyerSms = await smsService.send(
            buyer.phone,
            [
              {
                name: "ORDERID",
                value: order._id.toString(),
              },
              {
                name: "PRICE",
                value: String(order.total),
              },
            ],
            configs.sms.patternBuyerNewOrder,
          );

          if (buyerSms.status !== 1) {
            logger.error(
              `Failed to send order SMS to buyer ${buyer.phone}`,
              buyerSms,
            );
          }
        } catch (error) {
          logger.error(
            `Error sending order SMS to buyer ${buyer.phone}`,
            error,
          );
        }
      }

      // Send SMS to admins

      const admins = await this.userRepository.findByRole([
        "ADMIN",
        "SUPER_ADMIN",
      ]);

      for (const admin of admins) {
        try {
          const adminSms = await smsService.send(
            admin.phone,
            [
              {
                name: "ORDERID",
                value: order._id.toString(),
              },
              {
                name: "PRICE",
                value: String(order.total),
              },
            ],
            configs.sms.patternNewOrder,
          );

          if (adminSms.status !== 1) {
            logger.error(
              `Failed to send new order SMS to admin ${admin.phone}`,
              adminSms,
            );
          }
        } catch (error) {
          logger.error(
            `Error sending new order SMS to admin ${admin.phone}`,
            error,
          );
        }
      }
      return {
        message: "Checkout verified successfully.",
        data: createdOrder,
      };
    } finally {
      await session.endSession();
    }
  }
}
