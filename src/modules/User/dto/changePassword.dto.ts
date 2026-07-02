export class ChangePasswordDto {
  public userId: string;
  public currentPassword: string;
  public newPassword: string;
  public confirmNewPassword: string;

  constructor(data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) {
    this.userId = data.userId;
    this.currentPassword = data.currentPassword;
    this.newPassword = data.newPassword;
    this.confirmNewPassword = data.confirmNewPassword;
  }
}
