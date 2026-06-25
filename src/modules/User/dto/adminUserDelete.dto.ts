import { UserRole } from "../user.types";

export class AdminUserDeleteDto {
  public userId: string;
  public confirmationPhrase: string;
  public adminRole: UserRole;

  constructor(data: {
    userId: string;
    confirmationPhrase: string;
    adminRole: UserRole;
  }) {
    this.userId = data.userId;
    this.confirmationPhrase = data.confirmationPhrase;
    this.adminRole = data.adminRole;
  }
}
