import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redisClient: Redis | null = null;
let isConnected = false;

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

try {
  if (redisUrl) {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 1000, 3000);
      },
    });
  } else {
    redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 1000, 3000);
      },
    });
  }

  redisClient.on("connect", () => {
    isConnected = true;
    console.log("✅ [Auth Redis] Connected successfully to Redis server");
  });

  redisClient.on("error", (err: Error) => {
    isConnected = false;
    if (process.env.NODE_ENV !== "test") {
      console.warn("⚠️ [Auth Redis] Connection notice (using in-memory fallback):", err.message);
    }
  });

  redisClient.on("close", () => {
    isConnected = false;
  });

  redisClient.connect().catch(() => {
    isConnected = false;
  });
} catch (initErr: any) {
  console.warn("⚠️ [Auth Redis] Failed to initialize Redis client:", initErr?.message);
  redisClient = null;
  isConnected = false;
}

export const isRedisReady = () => isConnected && redisClient?.status === "ready";
export { redisClient };
export default redisClient;
