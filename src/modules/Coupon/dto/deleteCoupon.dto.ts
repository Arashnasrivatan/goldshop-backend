export class DeleteCouponDto {
  public couponId: string;

  constructor(data: { couponId: string }) {
    this.couponId = data.couponId;
  }
}
