import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The singleton is constructed at module import time from a path relative to
// process.cwd(), so each test chdirs into a fresh temp directory and
// re-imports the module (vi.resetModules) to keep every run isolated and
// confined to that temp directory.
describe("ViewStateBlobRepositoryFile", () => {
	let tempDir: string;
	let originalCwd: string;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(
			path.join(os.tmpdir(), "sola-mpd-view-state-blob-repo-test-"),
		);
		originalCwd = process.cwd();
		process.chdir(tempDir);
		vi.resetModules();
		// db/ doesn't exist yet on the first write in a fresh temp dir, so the
		// backupDbDirectoryOnce() call logs a swallowed error; silence it to
		// keep test output clean.
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		errorSpy.mockRestore();
		vi.restoreAllMocks();
		process.chdir(originalCwd);
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it("does not touch the filesystem on a bare import", async () => {
		await import("./ViewStateBlobRepositoryFile.js");

		expect(fs.existsSync(path.join(tempDir, "db"))).toBe(false);
	});

	it("put is idempotent: putting the same token twice keeps the original createdAt", async () => {
		const { viewStateBlobRepository } = await import(
			"./ViewStateBlobRepositoryFile.js"
		);

		vi.setSystemTime(1_000);
		viewStateBlobRepository.put("token-a", "first-data");
		const firstEntry = viewStateBlobRepository.get("token-a");

		vi.setSystemTime(2_000);
		viewStateBlobRepository.put("token-a", "second-data");
		const secondEntry = viewStateBlobRepository.get("token-a");

		expect(firstEntry?.data).toBe("first-data");
		expect(secondEntry?.data).toBe("first-data");
		expect(secondEntry?.createdAt).toBe(firstEntry?.createdAt);

		vi.useRealTimers();
	});

	it("get refreshes lastAccessedAt", async () => {
		const { viewStateBlobRepository } = await import(
			"./ViewStateBlobRepositoryFile.js"
		);

		vi.setSystemTime(1_000);
		viewStateBlobRepository.put("token-b", "some-data");

		vi.setSystemTime(5_000);
		const entry = viewStateBlobRepository.get("token-b");

		expect(entry?.lastAccessedAt).toBe(5_000);

		vi.useRealTimers();
	});

	it("get returns undefined for an unknown token", async () => {
		const { viewStateBlobRepository } = await import(
			"./ViewStateBlobRepositoryFile.js"
		);

		expect(viewStateBlobRepository.get("unknown-token")).toBeUndefined();
	});

	it("sweep removes only entries past the cutoff and returns the count", async () => {
		const { viewStateBlobRepository } = await import(
			"./ViewStateBlobRepositoryFile.js"
		);

		const now = 100_000_000;
		vi.setSystemTime(now - 10_000);
		viewStateBlobRepository.put("stale-token", "stale-data");

		vi.setSystemTime(now - 1_000);
		viewStateBlobRepository.put("fresh-token", "fresh-data");

		vi.setSystemTime(now);
		const removedCount = viewStateBlobRepository.sweep(5_000);

		expect(removedCount).toBe(1);
		expect(viewStateBlobRepository.get("stale-token")).toBeUndefined();
		expect(viewStateBlobRepository.get("fresh-token")?.data).toBe("fresh-data");

		vi.useRealTimers();
	});

	it("writes the temp file into the same directory as the destination before renaming", async () => {
		const { viewStateBlobRepository } = await import(
			"./ViewStateBlobRepositoryFile.js"
		);
		const renameSpy = vi.spyOn(fs, "renameSync");

		viewStateBlobRepository.put("token-c", "some-data");

		expect(renameSpy).toHaveBeenCalledTimes(1);
		const [tempPath, destPath] = renameSpy.mock.calls[0] as [string, string];
		expect(path.resolve(path.dirname(tempPath))).toBe(
			path.resolve(path.dirname(destPath)),
		);
		expect(path.basename(destPath)).toBe("view_state_blobs.json");
	});
});
