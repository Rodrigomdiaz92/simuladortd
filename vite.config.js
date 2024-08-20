// vite.config.js
import { defineConfig } from "vite";
import path from "path";
export default defineConfig({
  base: "/",
  server: {
    port: 1234,
  },
  resolve: {
    alias: {
      "@componentes": path.resolve(__dirname, "componentes"),
      "@clases": path.resolve(__dirname, "clases"),
      "@utils": path.resolve(__dirname, "utils"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        //actividad01: path.resolve(__dirname, "pages/actividad01/act.html"),
        //actividad02: path.resolve(__dirname, "pages/actividad02/act.html"),
        //actividad03: path.resolve(__dirname, "pages/actividad03/act.html"),
        actividad04: path.resolve(__dirname, "pages/actividad04/act.html"),
        actividad05: path.resolve(__dirname, "pages/actividad05/act.html"),
        actividad06: path.resolve(__dirname, "pages/actividad06/act.html"),
        actividad07: path.resolve(__dirname, "pages/actividad07/act.html"),
        actividad01: path.resolve(
          __dirname,
          "pages/actividades-data/hojas-de-calculo-01/graficos-simples/actividad01/act.html"
        ),
        actividad02: path.resolve(
          __dirname,
          "pages/actividades-data/hojas-de-calculo-01/graficos-simples/actividad02/act.html"
        ),
        actividad03: path.resolve(
          __dirname,
          "pages/actividades-data/hojas-de-calculo-01/graficos-simples/actividad03/act.html"
        ),
        desafio01: path.resolve(
          __dirname,
          "pages/actividades-data/hojas-de-calculo-01/graficos-simples/desafio01/act.html"
        ),
        desafio02: path.resolve(
          __dirname,
          "pages/actividades-data/hojas-de-calculo-01/graficos-simples/desafio02/act.html"
        ),
        actividad03b: path.resolve(
          __dirname,
          "pages/actividades-data/hojas-de-calculo-01/recuentos-condicionales/actividad03b/act.html"
        ),
        actividad04b: path.resolve(
          __dirname,
          "pages/actividades-data/hojas-de-calculo-01/recuentos-condicionales/actividad04b/act.html"
        ),
        actividad05b: path.resolve(
          __dirname,
          "pages/actividades-data/hojas-de-calculo-01/recuentos-condicionales/actividad05b/act.html"
        ),
        actividadTD1_01a: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-01/actividad01a/act.html"
        ),
        actividadTD1_01b: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-01/actividad01b/act.html"
        ),
        actividadTD1_02: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-01/actividad02/act.html"
        ),
        actividadTD1_03: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-01/actividad03/act.html"
        ),
        actividadTD1_04: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-01/actividad04/act.html"
        ),
        actividadTD1_ejemplo: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-01/ejemplo/act.html"
        ),
        actividadTD2_01: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-02/actividad01/act.html"
        ),
        actividadTD2_02: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-02/actividad02/act.html"
        ),
        actividadTD2_03: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-02/actividad03/act.html"
        ),
        actividadTD2_ejemplo: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-02/ejemplo/act.html"
        ),
        actividadTD3_01a: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-03/actividad01a/act.html"
        ),
        actividadTD3_01b: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-03/actividad01b/act.html"
        ),
        actividadTD3_ej02a: path.resolve(
          __dirname,
          "pages/actividades-data/tablas-dinamicas/tablas-dinamicas-03/ejemplo02a/act.html"
        ),
      },
    },
  },
});
