export class DeleteOrderDto {
  public orderId: string;
  public confirmationPhrase: string;

  constructor(data: { orderId: string; confirmationPhrase: string }) {
    this.orderId = data.orderId;
    this.confirmationPhrase = data.confirmationPhrase;
  }
}
