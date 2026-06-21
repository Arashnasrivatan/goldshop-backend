export class UnbanUserDto {
  public banId: string;

  constructor(data: { banId: string }) {
    this.banId = data.banId;
  }
}