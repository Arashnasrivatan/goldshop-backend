export class LoginDto {
  public _id: string;

  constructor(data: {
    _id: string;
  }) {
    this._id = data._id;
  }
}
