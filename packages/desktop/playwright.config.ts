import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 5000,
	retries: 0,
	workers: 1,
});
