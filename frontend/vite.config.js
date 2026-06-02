import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev server runs on 5173. The production build is emitted to `dist/` and
// served by nginx in the Docker image. Tailwind v4 is wired in via its Vite
// plugin (no separate PostCSS/Tailwind config files needed).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
});
