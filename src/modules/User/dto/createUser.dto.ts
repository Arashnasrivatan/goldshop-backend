export class CreateUserDto {
  public fullname: string;
  public phone: string;
  public password: string;

  constructor(fullname: string, phone: string, password: string) {
    this.fullname = fullname;
    this.phone = phone;
    this.password = password;
  }
}
