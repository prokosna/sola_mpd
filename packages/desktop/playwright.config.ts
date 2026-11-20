import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 60_000,
	retries: 0,
	workers: 1,
	use: {
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
	},
});
