export class UpdateAddressDto {
  public userId: string;
  public addressId: string;
  public title?: string;
  public postalCode?: string;
  public location?: {
    lat?: number;
    lng?: number;
  };
  public address?: string;

  constructor(data: {
    userId: string;
    addressId: string;
    title?: string;
    postalCode?: string;
    location?: { lat?: number; lng?: number };
    address?: string;
  }) {
    this.userId = data.userId;
    this.addressId = data.addressId;
    this.title = data.title;
    this.postalCode = data.postalCode;
    this.location = data.location;
    this.address = data.address;
  }
}
