export class CreateCheckoutDto {
  public userId: string;
  public shippingMethodId: string;
  public addressId?: string;
  public couponCode?: string;
  constructor(data: {
    userId: string;
    shippingMethodId: string;
    addressId?: string;
    couponCode?: string;
  }) {
    this.userId = data.userId;
    this.shippingMethodId = data.shippingMethodId;
    this.addressId = data.addressId;
    this.couponCode = data.couponCode;
  }
}
