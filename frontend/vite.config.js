import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true, // Listen on all local IPs
    port: 5173, // Default port
    strictPort: true, // Don't try another port if 5173 is taken
  },
});
