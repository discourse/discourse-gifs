import { Addon } from "@embroider/addon-dev/rollup";
import { babel } from "@rollup/plugin-babel";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const gjs = new Addon({
  srcDir: "src",
  destDir: "dist",
}).gjs;

export default {
  // This provides defaults that work well alongside `publicEntrypoints` below.
  // You can augment this if you need to.
  input: ["index.js"],
  output: {
    file: "dist/entrypoint.js",
    format: "es",
    sourcemap: true,
  },

  plugins: [
    babel({
      extensions: [".js", ".gjs"],
      babelHelpers: "bundled",
      configFile: resolve(
        dirname(fileURLToPath(import.meta.url)),
        "./babel.config.cjs"
      ),
    }),

    // Ensure that .gjs files are properly integrated as Javascript
    gjs(),
  ],
};
