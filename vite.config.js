import glsl from "vite-plugin-glsl";
import { resolve } from "path";
import { defineConfig } from "vite";
const isCodeSandbox = "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;

export default defineConfig({
  root: "src/",
  publicDir: "../static/",
  base: "./",
  server: {
    host: true,
    open: !isCodeSandbox, // Open if it's not a CodeSandbox
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(`${__dirname}/src`, "index.html"),
        s4: resolve(`${__dirname}/src`, "scenario04.html"),
      },
    },
  },
  plugins: [glsl()],
});
