export class UserIdDto {
  public userId: string;

  constructor(data: { userId: string }) {
    this.userId = data.userId;
  }
}
