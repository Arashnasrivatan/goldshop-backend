import { OrderStatus } from "./../order.types";

export class UpdateOrderDto {
  public orderId: string;

  public status?: OrderStatus;
  public adminNote?: string | null;
  public postTrackingCode?: string | null;

  constructor(data: {
    orderId: string;
    status?: OrderStatus;
    adminNote?: string | null;
    postTrackingCode?: string | null;
  }) {
    this.orderId = data.orderId;
    this.status = data.status;
    this.adminNote = data.adminNote;
    this.postTrackingCode = data.postTrackingCode;
  }
}