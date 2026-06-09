import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { stickersManifestPlugin } from "./vite-plugin-stickers-manifest.js";

export default defineConfig({
  plugins: [stickersManifestPlugin(), reactRouter(), tailwindcss()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
});
