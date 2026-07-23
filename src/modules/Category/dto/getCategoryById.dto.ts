export class GetCategoryByIdDto {
  public categoryId: string;

  constructor(data: { categoryId: string }) {
    this.categoryId = data.categoryId;
  }
}
