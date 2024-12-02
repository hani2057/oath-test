import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/instagram-short": {
        target: "https://api.instagram.com/oauth/access_token",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/instagram-short/, ""),
      },
      "/instagram-long": {
        target: "https://graph.instagram.com/access_token",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/instagram-long/, ""),
      },
    },
  },
});
