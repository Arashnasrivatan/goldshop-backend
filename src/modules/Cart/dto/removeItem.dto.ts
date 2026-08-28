export class RemoveItemDto {
  public userId: string;
  public productId: string;

  constructor(data: {
    userId: string;
    productId: string;
  }) {
    this.userId = data.userId;
    this.productId = data.productId;
  }
}