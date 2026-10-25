import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const systemKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const encodedKey = systemKey ? Buffer.from(systemKey).toString("base64") : "";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  define: {
    "process.env.GEMINI_API_KEY_B64": JSON.stringify(encodedKey),
  },
});
