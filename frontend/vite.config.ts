import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  define: {
    "process.env.GEMINI_API_KEY": JSON.stringify(
      process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ""
    ),
  },
});
