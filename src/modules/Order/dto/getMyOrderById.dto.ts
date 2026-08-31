export class GetMyOrderByIdDto {
  public userId: string;
  public orderId: string;

  constructor(data: { userId: string; orderId: string }) {
    this.userId = data.userId;
    this.orderId = data.orderId;
  }
}