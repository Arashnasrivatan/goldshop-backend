import { CartRepository } from "../Cart/cart.repository";
import { OrderRepository } from "../Order/order.repository";
import { CheckoutRepository } from "./checkout.repository";

export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly cartRepository: CartRepository,
    private readonly orderRepository: OrderRepository,
  ) {}
}
