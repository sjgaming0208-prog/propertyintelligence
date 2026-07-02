import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// When deploying to GitHub Pages the site is served from a repository
// subpath (https://<user>.github.io/<repo>/), so assets must be requested
// relative to that base. The deploy workflow sets VITE_BASE accordingly.
// Locally (dev + preview) the base defaults to "/".
const base = process.env.VITE_BASE ?? "/";

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
});
