import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import * as p from "path";
import { defineConfig } from "rollup"

const targets = ["src/index.ts", "src/react/index.ts"];

/**
 * 
 * @param {string} path
 * @returns {import("rollup").RollupOptions[]}
 */
const buildConfig = (path) => {
  const dirname = p.dirname(path).replace("src", "lib");

  return [
    {
      input: path,
      plugins: [
        esbuild({ tsconfig: "./tsconfig.json" }),
      ],
      output: [
        {
          file: p.join(dirname, "index.cjs.js"),
          format: "cjs",
          sourcemap: true,
        },
        {
          file: p.join(dirname, "index.esm.js"),
          format: "es",
          sourcemap: true,
        },
      ],
    },
    {
      input: path,
      plugins: [dts()],
      output: {
        file: p.join(dirname, "index.d.ts"),
        format: "es",
      },
    },
  ];
};

export default defineConfig(
  targets.flatMap((path) => buildConfig(path))
)