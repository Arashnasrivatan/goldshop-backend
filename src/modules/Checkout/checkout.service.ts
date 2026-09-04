import { CartRepository } from "../Cart/cart.repository";
import { OrderRepository } from "../Order/order.repository";
import { PriceRepository } from "../Price/price.repository";
import { ProductRepository } from "../Product/product.repository";
import { ShippingRepository } from "../Shipping/shipping.repository";
import { UserRepository } from "../User/user.repository";
import { CheckoutRepository } from "./checkout.repository";

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
}
