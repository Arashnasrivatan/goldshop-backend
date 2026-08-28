export class AddItemDto {
  public productId: string;
  public userId: string;

  constructor(data: { productId: string; userId: string }) {
    this.productId = data.productId;
    this.userId = data.userId;
  }
}
