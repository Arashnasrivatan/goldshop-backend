import { CreateShippingDto } from "./dto/createShipping.dto";
import ShippingModel from "./shipping.model";
import { IShippingMethod } from "./shipping.types";

export class ShippingRepository {
  async findByName(name: string) {
    return await ShippingModel.findOne({ name });
  }

  async countDocuments(): Promise<number> {
    return await ShippingModel.countDocuments();
  }

  async create(input: CreateShippingDto) {
    const { name, description, price, image, isActive, sortOrder } = input;

    const shippingData: Partial<IShippingMethod> = {
      name,
      description: description || null,
      price: Number(price),
      image: image,
      isActive: String(isActive) === "true",
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    };

    const shipping = await ShippingModel.create(shippingData);

    return shipping;
  }
}
