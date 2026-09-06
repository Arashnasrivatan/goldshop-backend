export class LogOutDto {
  public userId?: string;
  public refreshToken?: string;

  constructor(data: { userId?: string; refreshToken?: string }) {
    this.userId = data.userId;
    this.refreshToken = data.refreshToken;
  }
}
