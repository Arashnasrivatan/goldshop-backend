export class DeleteCategoryDto {
  public categoryId: string;
  public confirmationPhrase: string;

  constructor(data: { categoryId: string; confirmationPhrase: string }) {
    this.categoryId = data.categoryId;
    this.confirmationPhrase = data.confirmationPhrase;
  }
}
