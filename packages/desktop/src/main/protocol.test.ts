import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { resolveRendererFilePath } from "./protocol.js";

describe("resolveRendererFilePath", () => {
	const root = path.resolve("/app/renderer");

	it("returns existing file path for static assets", async () => {
		const target = path.join(root, "assets", "main.js");
		const resolved = await resolveRendererFilePath(
			root,
			"sola://app/assets/main.js",
			async (p) => {
				if (p === target) return { isDirectory: () => false };
				throw new Error("ENOENT");
			},
		);

		expect(resolved).toBe(target);
	});

	it("serves index.html for directory paths", async () => {
		const resolved = await resolveRendererFilePath(
			root,
			"sola://app/",
			async () => ({ isDirectory: () => true }),
		);

		expect(resolved).toBe(path.join(root, "index.html"));
	});

	it("falls back to index.html for SPA routes that do not exist on disk", async () => {
		const resolved = await resolveRendererFilePath(
			root,
			"sola://app/home/all-songs",
			async () => {
				throw new Error("ENOENT");
			},
		);

		expect(resolved).toBe(path.join(root, "index.html"));
	});

	it("blocks backslash path traversal before touching the filesystem", async () => {
		// `sola` is a non-special scheme so URL parsing preserves backslashes;
		// `..` only escapes after backslash normalization.
		const statFn = vi.fn(async () => ({ isDirectory: () => false }));
		const resolved = await resolveRendererFilePath(
			root,
			"sola://app/..\\..\\etc\\passwd",
			statFn,
		);

		expect(resolved).toBe(path.join(root, "index.html"));
		expect(statFn).not.toHaveBeenCalled();
	});

	it("normalizes backslashes in request URLs", async () => {
		const target = path.join(root, "assets", "logo.png");
		const resolved = await resolveRendererFilePath(
			root,
			"sola://app/assets\\logo.png",
			async (p) => {
				if (p === target) return { isDirectory: () => false };
				throw new Error("ENOENT");
			},
		);

		expect(resolved).toBe(target);
	});
});
