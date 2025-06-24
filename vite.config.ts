import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/sonar/procedures": {
        target: "https://10.4.10.20",
        changeOrigin: true,
        secure: false, // disables SSL verification for self-signed certs
      },
    },
  },
});
