import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const config = {
	input: "src/index.ts",
	output: {
		dir: "dist",
		format: "module",
	},
	plugins: [
		typescript({
			isolatedModules: false,
		}),
		babel({ babelHelpers: "bundled" }),
		terser(),
		nodeResolve(),
		commonjs(),
		json(),
	],
};
export default config;
