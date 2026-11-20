import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"#backend": path.resolve(__dirname, "../backend/src"),
		},
	},
	test: {
		globals: true,
		root: "src",
		reporters: ["default"],
	},
});
