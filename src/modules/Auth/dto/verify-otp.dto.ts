export class VerifyOtpDto {
  public fullname: string;
  public phone: string;
  public password: string;
  public otp: string;

  constructor(data: {
    fullname: string;
    phone: string;
    password: string;
    otp: string;
  }) {
    this.fullname = data.fullname;
    this.phone = data.phone;
    this.password = data.password;
    this.otp = data.otp;
  }
}
