import { OrderStatus } from "./../order.types";

export class GetMyOrdersDto {
  public userId: string;
  public page: number;
  public limit: number;
  public sort: "asc" | "desc";
  public status?: OrderStatus;

  constructor(data: {
    userId: string;
    page?: number;
    limit?: number;
    sort?: "asc" | "desc";
    status?: OrderStatus;
  }) {
    this.userId = data.userId;
    this.page = data.page ?? 1;
    this.limit = data.limit ?? 10;
    this.sort = data.sort ?? "desc";
    this.status = data.status;
  }
}
