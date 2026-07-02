export class UpdateMeDto {
  public userId: string;
  public fullname?: string;

  constructor(data: { userId: string; fullname?: string }) {
    this.userId = data.userId;
    this.fullname = data.fullname;
  }
}
