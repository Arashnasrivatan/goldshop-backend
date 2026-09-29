export class GetCouponByIdDto {
  public couponId: string;

  constructor(data: { couponId: string }) {
    this.couponId = data.couponId;
  }
}
