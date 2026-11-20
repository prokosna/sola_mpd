import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/**/*.ts", "!src/**/*.test.ts"],
	unbundle: true,
	dts: true,
	deps: { neverBundle: [/^[^./]/] },
	outExtensions: () => ({ js: ".js" }),
	clean: false,
});
