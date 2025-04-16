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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    injectHtml({
      scripts: [
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
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      external: ["react", "react-dom"],
      plugins: [
        inject({
          React: "react",
          ReactDOM: "react-dom",
        }),
      ],
    },
  },
});
