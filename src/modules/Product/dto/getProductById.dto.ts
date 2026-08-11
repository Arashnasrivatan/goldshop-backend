export class GetProductByIdDto {
  public productId: string;

  constructor(data: { productId: string }) {
    this.productId = data.productId;
  }
}
