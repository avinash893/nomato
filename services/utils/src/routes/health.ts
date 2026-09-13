import express from "express";
import { isRedisReady } from "../config/redis.js";

const router = express.Router();

router.get("/", (req, res) => {
  const cfRay = req.headers["cf-ray"] || null;
  res.status(200).json({
    status: "healthy",
    service: "utils-service",
    timestamp: new Date().toISOString(),
    redis: isRedisReady() ? "connected" : "fallback_mode",
    cloudflareRay: cfRay,
  });
});

export default router;
