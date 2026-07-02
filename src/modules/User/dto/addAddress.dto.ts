export class AddAddressDto {
  public userId: string;
  public title: string;
  public postalCode: string;
  public location: {
    lat: number;
    lng: number;
  };
  public address: string;

  constructor(data: {
    userId: string;
    title: string;
    postalCode: string;
    location: { lat: number; lng: number };
    address: string;
  }) {
    this.userId = data.userId;
    this.title = data.title;
    this.postalCode = data.postalCode;
    this.location = {
      lat: data.location.lat,
      lng: data.location.lng,
    };
    this.address = data.address;
  }
}
