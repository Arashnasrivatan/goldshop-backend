export class UpdateItemDto {
  public userId: string;
  public productId: string;
  public quantity: number;

  constructor(data: { userId: string; productId: string; quantity: number }) {
    this.userId = data.userId;
    this.productId = data.productId;
    this.quantity = data.quantity;
  }
}
