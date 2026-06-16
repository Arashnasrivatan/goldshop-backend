import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { AppError } from "../errors/AppError";
import { redisService } from "./../services/redis.service";

interface RateLimitOption {
  windowMs: number;
  max: number;
  message: string;
}

export const createRateLimiter = (options: RateLimitOption) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
      // @ts-expect-error: The RedisStore expects a different type for sendCommand, but we can ignore it since we know our redisService has the correct method.
      sendCommand: (...args: string[]) => redisService.call(...args),
    }),

    handler: (req, res, next, options) => {
      next(new AppError(options.message, 429));
    },
  });
};
