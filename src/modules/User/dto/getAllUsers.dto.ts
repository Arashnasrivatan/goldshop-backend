export class GetAllUsersDto {
  public search?: string;
  public userId?: string;
  public phone?: string;

  public from?: string;
  public to?: string;

  public role?: string;
  public includeBanned?: boolean;

  public sort?: string;
  public limit?: number;
  public page?: number;

  constructor(data: {
    search?: string;
    userId?: string;
    phone?: string;
    from?: string;
    to?: string;
    role?: string;
    sort?: string;
    includeBanned?: boolean;
    limit?: number;
    page?: number;
  }) {
    this.search = data.search;
    this.userId = data.userId;
    this.phone = data.phone;
    this.from = data.from;
    this.to = data.to;
    this.sort = data.sort;

    this.role = data.role;
    this.includeBanned = data.includeBanned;

    this.limit = data.limit;
    this.page = data.page;
  }
}
