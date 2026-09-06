import { DashboardPeriod } from "../dashboard.types";

export class GetDashboardDto {
  public period: DashboardPeriod;

  constructor(data: { period: DashboardPeriod }) {
    this.period = data.period ?? "THIS_MONTH";
  }
}
