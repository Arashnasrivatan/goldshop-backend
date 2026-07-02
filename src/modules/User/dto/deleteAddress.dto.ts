export class DeleteAddressDto {
  public userId: string;
  public addressId: string;
  public confirmationPhrase: string;

  constructor(data: {
    userId: string;
    addressId: string;
    confirmationPhrase: string;
  }) {
    this.userId = data.userId;
    this.addressId = data.addressId;
    this.confirmationPhrase = data.confirmationPhrase;
  }
}
