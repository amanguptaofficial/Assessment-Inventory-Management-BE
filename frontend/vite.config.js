import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server runs on 5173. The production build is emitted to `dist/` and
// served by nginx in the Docker image.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
});
