import redisClient from "../../configs/redis.config";

export class RedisService {
  private readonly client = redisClient;

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, serializedValue, "EX", ttlSeconds);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async setIfNotExists(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<boolean> {
    const serializedValue = JSON.stringify(value);
    const result = await this.client.set(
      key,
      serializedValue,
      "EX",
      ttlSeconds,
      "NX",
    );

    return result === "OK";
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;

    return JSON.parse(data) as T;
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async delMany(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return await this.client.del(keys);
  }

  async ttl(key: string): Promise<number | null> {
    const ttl = await this.client.ttl(key);

    if (ttl <= 0) return null;
    return ttl;
  }

  async expire(key: string, ttlSeconds: number): Promise<number> {
    return await this.client.expire(key, ttlSeconds);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async call<T = unknown>(command: string, ...args: unknown[]): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.client.call(command, ...args);
  }
}

export const redisService = new RedisService();
