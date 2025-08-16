/// <reference types="vitest" />

import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000",
			},
			"/io": {
				target: "ws://localhost:3000",
				ws: true,
			},
		},
	},
	build: {
		rollupOptions: {
			plugins: [visualizer()],
		},
	},
	test: {
		globals: true,
		environment: "happy-dom",
	},
});
