export class RefreshTokenDto {
  public refreshToken: string;

  constructor(data:{refreshToken: string}) {
    this.refreshToken = data.refreshToken;
  }
}
