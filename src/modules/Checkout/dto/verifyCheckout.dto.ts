export class VerifyCheckoutDto {
  public readonly userId: string;
  public readonly trackId: string;

  constructor(data: { userId: string; trackId: string }) {
    this.userId = data.userId;
    this.trackId = data.trackId.trim();
  }
}
