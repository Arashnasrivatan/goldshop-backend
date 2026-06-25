import { UserRole } from "../user.types";

export class AdminUserUpdateDto {
  public userId: string;
  public fullname?: string;
  public adminRole: UserRole;

  constructor(data: {
    userId: string;
    fullname?: string;
    adminRole: UserRole;
  }) {
    this.userId = data.userId;
    this.fullname = data.fullname;
    this.adminRole = data.adminRole;
  }
}
