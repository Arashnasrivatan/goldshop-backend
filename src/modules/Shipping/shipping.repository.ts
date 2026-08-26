import { CreateShippingDto } from "./dto/createShipping.dto";
import ShippingModel from "./shipping.model";
import { IShippingMethod } from "./shipping.types";

export class ShippingRepository {
  async findByName(name: string) {
    return await ShippingModel.findOne({ name });
  }

  async findById(shippingId: string) {
    return await ShippingModel.findOne({ _id: shippingId });
  }

  async countDocuments(): Promise<number> {
    return await ShippingModel.countDocuments();
  }

  async findAllActive() {
    return await ShippingModel.find({
      isActive: true,
    }).sort({
      sortOrder: 1,
    });
  }

  async create(input: CreateShippingDto) {
    const { name, description, price, image, isActive, sortOrder } = input;

    const shippingData: Partial<IShippingMethod> = {
      name,
      description: description || null,
      price: Number(price),
      image,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      ...(isActive !== undefined && {
        isActive: Boolean(isActive),
      }),
    };

    const shipping = await ShippingModel.create(shippingData);

    return shipping;
  }
}
