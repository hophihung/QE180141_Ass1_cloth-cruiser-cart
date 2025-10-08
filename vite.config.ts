import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devApiTarget = env.VITE_DEV_API_URL || "http://localhost:5000";

  return {
    server: {
      host: "::",
      port: 8080,
      // Proxy API calls in development to avoid CORS (backend only allows deployed origin)
      proxy: {
        "/api": {
          target: devApiTarget,
          changeOrigin: true,
          secure: false,
          // No path rewrite needed because backend already expects /api/*
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
