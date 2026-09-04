import CheckoutModel, { ICheckoutDocument } from "./checkout.model";
import { ICheckout } from "./checkout.types";

export class CheckoutRepository {
  async create(
    data: Omit<ICheckout, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ICheckoutDocument> {
    return CheckoutModel.create(data);
  }
}
