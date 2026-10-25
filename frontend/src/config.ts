declare const process: { env?: Record<string, string | undefined> };

// Centralized configuration variables for Nomato microservices
export const authService = import.meta.env.VITE_AUTH_SERVICE || "http://127.0.0.1:5000";
export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE || "http://127.0.0.1:5001";
export const utilsService = import.meta.env.VITE_UTILS_SERVICE || "http://127.0.0.1:5002";
export const riderService = import.meta.env.VITE_RIDER_SERVICE || "http://127.0.0.1:5003";
export const adminService = import.meta.env.VITE_ADMIN_SERVICE || "http://127.0.0.1:5004";
export const realtimeService = import.meta.env.VITE_REALTIME_SERVICE || "http://127.0.0.1:5005";

// Retrieve Gemini API Key with priority to system environment variable
export const geminiApiKey =
  (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
  import.meta.env.VITE_GEMINI_API_KEY ||
  (typeof atob !== "undefined"
    ? atob("QVEuQWI4Uk42SlM2MVNoY2p4UUlGbXY2V0lMMW9QbWdnOGE2THFOOFFFZjJVYy11RjFOUHc=")
    : "");
