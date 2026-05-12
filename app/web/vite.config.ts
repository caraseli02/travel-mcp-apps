import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: "src/component.tsx",
      formats: ["es"],
      fileName: () => "component.js",
    },
  },
});
