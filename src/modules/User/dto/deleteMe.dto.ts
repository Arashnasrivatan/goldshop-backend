export class DeleteMeDto {
  public userId: string
  public confirmationPhrase?: string

  constructor(data: { userId: string, fullname?: string, confirmationPhrase?: string }) {
    this.userId = data.userId;
    this.confirmationPhrase = data.confirmationPhrase;
  }
}