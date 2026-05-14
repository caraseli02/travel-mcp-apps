import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: "src/component.tsx",
      formats: ["es"],
      fileName: () => "component.js",
    },
    rollupOptions: {
      output: {
        chunkFileNames: "chunks/[name].js",
      },
    },
  },
});
