export class AddProductImagesDto {
  public productId: string;

  constructor(data: { productId: string }) {
    this.productId = data.productId;
  }
}
