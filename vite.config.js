// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        actividad01: path.resolve(__dirname, "pages/actividad01/act.html"),
        actividad02: path.resolve(__dirname, "pages/actividad02/act.html"),
        actividad03: path.resolve(__dirname, "pages/actividad03/act.html"),
        actividad04: path.resolve(__dirname, "pages/actividad04/act.html"),
      },
    },
  },
});
