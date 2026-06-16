import { Redis } from "ioredis";
import configs from "./env.config";

const redis = new Redis(configs.redis.uri);

export default redis;

redis.on("error", (err) => console.error("Redis error:", err));
