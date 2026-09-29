export class GetAllCouponsDto {
  public page?: number;
  public limit?: number;
  public search?: string;
  public isActive?: string;

  constructor(data: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
  }) {
    this.page = data.page;
    this.limit = data.limit;
    this.search = data.search;
    this.isActive = data.isActive;
  }
}
