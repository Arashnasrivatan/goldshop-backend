import { OrderStatus } from "./../order.types";

export class GetAllOrdersDto {
  public search?: string;
  public userId?: string;
  public status?: OrderStatus;
  public paymentAuthority?: string;
  public postTrackingCode?: string;
  public from?: string;
  public to?: string;
  public includeDeleted: boolean;
  public limit: number;
  public page: number;
  public sort: "asc" | "desc";

  constructor(data: {
    search?: string;
    userId?: string;
    status?: OrderStatus;
    paymentAuthority?: string;
    postTrackingCode?: string;
    from?: string;
    to?: string;
    includeDeleted?: boolean;
    limit?: number;
    page?: number;
    sort?: "asc" | "desc";
  }) {
    this.search = data.search;
    this.userId = data.userId;
    this.status = data.status;
    this.paymentAuthority = data.paymentAuthority;
    this.postTrackingCode = data.postTrackingCode;
    this.from = data.from;
    this.to = data.to;
    this.includeDeleted = data.includeDeleted ?? false;
    this.limit = data.limit ?? 10;
    this.page = data.page ?? 1;
    this.sort = data.sort ?? "desc";
  }
}