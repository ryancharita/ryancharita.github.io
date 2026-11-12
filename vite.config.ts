import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// ryancharita.github.io is a user site, so it is served from the domain root.
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  // three.js is lazy-loaded with the Scene chunk; ~930 kB before gzip is expected.
  build: { chunkSizeWarningLimit: 1000 },
});
