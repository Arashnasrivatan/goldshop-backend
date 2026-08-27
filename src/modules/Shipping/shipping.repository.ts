import { CreateShippingDto } from "./dto/createShipping.dto";
import { GetAllShippingsDto } from "./dto/getAllShippings.dto";
import ShippingModel, { IShippingMethodDocument } from "./shipping.model";
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

  async findAll(filters: GetAllShippingsDto) {
    const { search, isActive } = filters;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search?.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    return ShippingModel.find(filter)
      .sort({
        sortOrder: 1,
        createdAt: 1,
      })
      .lean();
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

  async updateById(
    shippingId: string,
    updateData: Partial<IShippingMethod>,
  ): Promise<IShippingMethodDocument | null> {
    return ShippingModel.findByIdAndUpdate(
      shippingId,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async deleteById(
    shippingId: string,
  ): Promise<IShippingMethodDocument | null> {
    return ShippingModel.findByIdAndDelete(shippingId);
  }
}
