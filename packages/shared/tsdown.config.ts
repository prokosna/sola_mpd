import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/**/*.ts", "!src/**/*.test.ts"],
	unbundle: true,
	dts: true,
	// Exclude Windows drive-letter paths (e.g. D:\...) so resolved local imports
	// are not treated as bare external specifiers on Windows.
	deps: { neverBundle: [/^(?![./]|[a-zA-Z]:[/\\])/] },
	outExtensions: () => ({ js: ".js" }),
	clean: false,
});
