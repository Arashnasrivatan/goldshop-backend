export class ResetPasswordDto {
  public token: string;
  public newPassword: string;
  public confirmPassword: string;

  constructor(data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    this.token = data.token;
    this.newPassword = data.newPassword;
    this.confirmPassword = data.confirmPassword;
  }
}
