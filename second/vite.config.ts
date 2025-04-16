import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import injectHtml from "vite-plugin-html-config";
import inject from "@rollup/plugin-inject";

// CDN URLs for external dependencies
const REACT_CDN =
  "https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js";
const REACT_DOM_CDN =
  "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js";
const CRYPTO_JS_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    viteSingleFile(),
    injectHtml({
      scripts: [
        {
          src: CRYPTO_JS_CDN,
          crossorigin: true,
        },
        {
          src: REACT_CDN,
          crossorigin: true,
        },
        {
          src: REACT_DOM_CDN,
          crossorigin: true,
        },
      ],
    }),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    copyPublicDir: false, // Prevent copying of public directory
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        format: "iife",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        assetFileNames: "[name].[ext]",
      },
      plugins: [
        inject({
          React: "react",
          ReactDOM: "react-dom",
        }),
      ],
    },
  },
});
