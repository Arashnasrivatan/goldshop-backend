import { CheckoutRepository } from "./checkout.repository";

export class CheckoutService {
  constructor(private readonly checkoutRepository: CheckoutRepository) {}
}
