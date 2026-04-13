import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
	{
		entry: {
			"main/index": "src/main/index.ts",
			"ipc/index": "src/ipc/index.ts",
		},
		platform: "node",
		dts: false,
		external: ["electron", "../ipc/index.mjs"],
		noExternal: [/^(?!electron$).*/],
		alias: {
			"#backend": path.resolve(__dirname, "../backend/src"),
		},
	},
	{
		entry: {
			"preload/index": "src/preload/index.ts",
		},
		format: "cjs",
		platform: "node",
		dts: false,
		external: ["electron"],
	},
]);
