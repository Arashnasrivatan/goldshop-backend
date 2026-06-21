export class GetBanDto {
  public banId: string;

  constructor(data: { banId: string }) {
    this.banId = data.banId;
  }
}
