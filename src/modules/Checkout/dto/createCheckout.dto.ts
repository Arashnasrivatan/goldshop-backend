export class CreateCheckoutDto {
  public userId: string;
  public shippingMethodId: string;
  public addressId?: string;
  constructor(data: {
    userId: string;
    shippingMethodId: string;
    addressId?: string;
  }) {
    this.userId = data.userId;
    this.shippingMethodId = data.shippingMethodId;
    this.addressId = data.addressId;
  }
}
