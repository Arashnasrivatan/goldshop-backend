export class GetAllBansDto {
  public search?: string;
  public phone?: string;
  public userId?: string;
  public bannedBy?: string;
  public banReason?: string;

  public from?: string;
  public to?: string;

  public sort?: string;
  public limit?: number;
  public page?: number;

  constructor(data: {
    search?: string;
    phone?: string;
    userId?: string;
    bannedBy?: string;
    banReason?: string;
    from?: string;
    to?: string;
    sort?: string;
    limit?: number;
    page?: number;
  }) {
    this.search = data.search;
    this.phone = data.phone;
    this.userId = data.userId;
    this.bannedBy = data.bannedBy;
    this.banReason = data.banReason;
    this.from = data.from;
    this.to = data.to;
    this.sort = data.sort;

    this.limit = data.limit;
    this.page = data.page;
  }
}
