import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	retries: 0,
	workers: 1,
});
