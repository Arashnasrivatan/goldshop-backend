import { ShippingMethodImage } from "../shipping.types";

export class UpdateShippingDto {
  public shippingId: string;
  public name?: string;
  public description?: string;
  public price?: string;
  public image?: ShippingMethodImage;
  public isActive?: string;
  public sortOrder?: string;

  constructor(data: {
    shippingId: string;
    name?: string;
    description?: string;
    price?: string;
    image?: ShippingMethodImage;
    isActive?: string;
    sortOrder?: string;
  }) {
    this.shippingId = data.shippingId;

    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.image = data.image;
    this.isActive = data.isActive;
    this.sortOrder = data.sortOrder;
  }
}
