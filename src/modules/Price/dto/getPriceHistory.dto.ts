export class GetPriceHistoryDto {
  public page: number;
  public limit: number;

  constructor(data: { page: number; limit: number }) {
    this.page = data.page;
    this.limit = data.limit;
  }
}
