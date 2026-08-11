export class DeleteProductDto {
  public productId: string;
  public confirmationPhrase: string;

  constructor(data: { productId: string; confirmationPhrase: string }) {
    this.productId = data.productId;
    this.confirmationPhrase = data.confirmationPhrase;
  }
}
