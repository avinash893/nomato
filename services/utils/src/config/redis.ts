import Redis from "ioredis";
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
      retryStrategy(times) {
        if (times > 3) return null; // Stop reconnecting after 3 attempts
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
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 1000, 3000);
      },
    });
  }

  redisClient.on("connect", () => {
    isConnected = true;
    console.log("✅ [Redis] Connected successfully to Redis server");
  });

  redisClient.on("error", (err) => {
    isConnected = false;
    // Suppress spammy offline logs, graceful fallback handles it
    if (process.env.NODE_ENV !== "test") {
      console.warn("⚠️ [Redis] Connection notice (will use in-memory rate limiting fallback):", err.message);
    }
  });

  redisClient.on("close", () => {
    isConnected = false;
  });

  // Attempt initial non-blocking connection
  redisClient.connect().catch(() => {
    isConnected = false;
  });
} catch (initErr: any) {
  console.warn("⚠️ [Redis] Failed to initialize Redis client:", initErr?.message);
  redisClient = null;
  isConnected = false;
}

export const isRedisReady = () => isConnected && redisClient?.status === "ready";
export { redisClient };
export default redisClient;
