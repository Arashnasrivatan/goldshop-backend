export class EditBanDto {
  public banId: string;
  public banReason: string;

  constructor(data: { banId: string; banReason: string }) {
    this.banId = data.banId;
    this.banReason = data.banReason;
  }
}
