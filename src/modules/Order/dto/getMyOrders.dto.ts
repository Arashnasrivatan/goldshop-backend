import { OrderStatus } from "./../order.types";

export class GetMyOrdersDto {
  public userId: string;
  public page: string;
  public limit: string;
  public sort: "asc" | "desc";
  public status?: OrderStatus;

  constructor(data: {
    userId: string;
    page?: string;
    limit?: string;
    sort?: "asc" | "desc";
    status?: OrderStatus;
  }) {
    this.userId = data.userId;
    this.page = data.page ?? "1";
    this.limit = data.limit ?? "10";
    this.sort = data.sort ?? "desc";
    this.status = data.status;
  }
}
