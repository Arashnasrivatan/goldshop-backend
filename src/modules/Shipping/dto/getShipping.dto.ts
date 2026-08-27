export class GetShippingDto {
  public shippingId: string;

  constructor(data: { shippingId: string }) {
    this.shippingId = data.shippingId;
  }
}
