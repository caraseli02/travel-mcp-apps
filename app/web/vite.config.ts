import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        trip_board_v3: resolve(__dirname, "templates/trip_board_v3.html"),
        trip_budget_v3: resolve(__dirname, "templates/trip_budget_v3.html"),
        trip_clarification_v1: resolve(__dirname, "templates/trip_clarification_v1.html"),
        trip_inbox_v2: resolve(__dirname, "templates/trip_inbox_v2.html"),
        trip_itinerary_v3: resolve(__dirname, "templates/trip_itinerary_v3.html"),
      },
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
