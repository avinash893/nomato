// Centralized configuration variables for Nomato microservices
export const authService = import.meta.env.VITE_AUTH_SERVICE || "http://127.0.0.1:5000";
export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE || "http://127.0.0.1:5001";
export const utilsService = import.meta.env.VITE_UTILS_SERVICE || "http://127.0.0.1:5002";
export const riderService = import.meta.env.VITE_RIDER_SERVICE || "http://127.0.0.1:5003";
export const adminService = import.meta.env.VITE_ADMIN_SERVICE || "http://127.0.0.1:5004";
export const realtimeService = import.meta.env.VITE_REALTIME_SERVICE || "http://127.0.0.1:5005";

