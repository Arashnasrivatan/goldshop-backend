export class BanUserDto {
  public userId: string;
  public banReason: string;
  public adminId: string;

  constructor(data: { userId: string; banReason: string; adminId: string }) {
    this.userId = data.userId;
    this.banReason = data.banReason;
    this.adminId = data.adminId;
  }
}
