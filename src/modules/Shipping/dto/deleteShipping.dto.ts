export class DeleteShippingDto {
  public shippingId: string;
  public confirmationPhrase: string;

  constructor(data: { shippingId: string; confirmationPhrase: string }) {
    this.shippingId = data.shippingId;
    this.confirmationPhrase = data.confirmationPhrase;
  }
}
