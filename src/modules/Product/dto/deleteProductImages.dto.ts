export class DeleteProductImagesDto {
  public productId: string;
  public imageKeys: string[];

  constructor(data: { productId: string; imageKeys: string[] }) {
    this.productId = data.productId;
    this.imageKeys = data.imageKeys;
  }
}
