import configs from "../../configs/env.config";

export class PriceStatusService {
  private static consecutiveFailures: number = 0;
  private static max_failures = configs.price.maxFailures;
  private static start_hour = configs.price.startHour;
  private static end_hour = configs.price.endHour;

  public static isMarketOpen(): boolean {
    const currentHour = new Date().getHours();
    return currentHour >= this.start_hour && currentHour < this.end_hour;
  }

  public static recordSuccess(): void {
    this.consecutiveFailures = 0;
  }

  public static recordFailure(): number {
    this.consecutiveFailures++;
    return this.consecutiveFailures;
  }

  public static isPriceDisplayAllowed(): {
    allowed: boolean;
    message?: string;
  } {
    if (!this.isMarketOpen()) {
      return {
        allowed: false,
        message:
          "Market is currently closed. Operating hours are 10:00 to 22:00.",
      };
    }

    if (this.consecutiveFailures >= this.max_failures) {
      return {
        allowed: false,
        message:
          "Price service is temporarily unavailable due to connectivity issues.",
      };
    }

    return { allowed: true };
  }
}
