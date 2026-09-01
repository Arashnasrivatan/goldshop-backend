export class GetOrderByIdDto {
  public orderId: string;

  constructor(data: { orderId: string }) {
    this.orderId = data.orderId;
  }
}