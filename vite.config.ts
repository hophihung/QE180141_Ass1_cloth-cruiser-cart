import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy API calls in development to avoid CORS (backend only allows deployed origin)
    proxy: {
      '/api': {
        target: 'https://qe180141-ass1.onrender.com',
        changeOrigin: true,
        secure: true,
        // No path rewrite needed because backend already expects /api/*
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
