import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		root: "src",
		reporters: ["default"],
	},
});
