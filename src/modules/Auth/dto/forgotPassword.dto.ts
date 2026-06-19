export class ForgotPasswordDto {
  public phone: string;

  constructor(data: { phone: string }) {
    this.phone = data.phone;
  }
}
