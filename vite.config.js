import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // 👇 ΚΑΝΕΙ GLOBAL ΤΑ VARIABLES
        additionalData: `@use "/src/_variables.scss" as *;`,
      },
    },
  },
});
