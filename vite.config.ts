import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  server: {
    port: 5173,

    host: "0.0.0.0",
    cors: false,
    proxy: {
      "/api": {
        target: "http:0.0.0.0:8000",
        changeOrigin: true,
      },
    },
  },
});
