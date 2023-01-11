import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/attachments": "http://localhost:3000",
    },
  },
});
