import configs from "../../configs/env.config";

export class PriceStatusService {
  private static consecutiveFailures: number = 0;
  private static max_failures = configs.price.maxFailures;
  private static start_time = configs.price.startTime;
  private static end_time = configs.price.endTime;
  private static always_open = configs.price.alwaysOpen;

  public static isMarketOpen(): boolean {
    if (this.always_open) {
      return true;
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Tehran",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    };

    const currentTimeString = new Intl.DateTimeFormat("en-US", options).format(
      new Date(),
    );

    const currentMinutes = this.timeToMinutes(currentTimeString);
    const startMinutes = this.timeToMinutes(this.start_time);
    const endMinutes = this.timeToMinutes(this.end_time);

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  private static timeToMinutes(timeStr: string): number {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0] || "0", 10);
    const minutes = parseInt(parts[1] || "0", 10);

    return hours * 60 + minutes;
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
        message: `Market is currently closed. Operating hours are ${this.start_time} to ${this.end_time}.`,
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
