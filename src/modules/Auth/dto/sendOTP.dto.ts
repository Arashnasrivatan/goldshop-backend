export class SendOtpDto {
  public phone: string;

  constructor(data:{phone: string}) {
    this.phone = data.phone;
  }
}
