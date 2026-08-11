import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { create, type JsonObject } from "@bufbuild/protobuf";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The six repository singletons are constructed at module import time from
// paths relative to process.cwd(), so each test chdirs into a fresh temp
// directory and re-imports the module (vi.resetModules) to keep every run
// isolated and confined to that temp directory.
describe("ConfigRepositoryFile", () => {
	let tempDir: string;
	let originalCwd: string;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(
			path.join(os.tmpdir(), "sola-mpd-config-repo-test-"),
		);
		originalCwd = process.cwd();
		process.chdir(tempDir);
		vi.resetModules();
		// db/ doesn't exist yet on the first import in a fresh temp dir, so
		// the module-level backupDbDirectory() call logs a swallowed error;
		// silence it to keep test output clean.
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		errorSpy.mockRestore();
		vi.restoreAllMocks();
		vi.doUnmock("../functions/migrateConfigDocument.js");
		process.chdir(originalCwd);
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it("stamps the current schema version when save() runs", async () => {
		const { browserStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		browserStateRepository.update(
			create(BrowserStateSchema, { schemaVersion: 0, filters: [] }),
		);

		const written = JSON.parse(
			fs.readFileSync(path.join(tempDir, "db", "browser_state.json"), "utf-8"),
		);
		expect(written.schemaVersion).toBe(1);
	});

	it("leaves the original file intact when the atomic write fails mid-way", async () => {
		const { browserStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		const filePath = path.join(tempDir, "db", "browser_state.json");
		const originalContent = fs.readFileSync(filePath, "utf-8");

		vi.spyOn(fs, "writeFileSync").mockImplementation(() => {
			throw new Error("disk full");
		});

		expect(() =>
			browserStateRepository.update(
				create(BrowserStateSchema, { schemaVersion: 1, filters: [] }),
			),
		).toThrow("disk full");

		expect(fs.readFileSync(filePath, "utf-8")).toBe(originalContent);
		const dbFiles = fs.readdirSync(path.join(tempDir, "db"));
		expect(dbFiles.some((name) => name.endsWith(".tmp"))).toBe(false);
	});

	it("writes the temp file into the same directory as the destination before renaming", async () => {
		const { browserStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		const renameSpy = vi.spyOn(fs, "renameSync");

		browserStateRepository.update(
			create(BrowserStateSchema, { schemaVersion: 1, filters: [] }),
		);

		expect(renameSpy).toHaveBeenCalledTimes(1);
		const [tempPath, destPath] = renameSpy.mock.calls[0] as [string, string];
		// fs.renameSync cannot cross filesystems, so the temp file must live
		// in the same directory as the file it replaces (path.resolve to
		// normalize away the "./" that path.join drops from the temp path).
		expect(path.resolve(path.dirname(tempPath))).toBe(
			path.resolve(path.dirname(destPath)),
		);
		expect(path.basename(destPath)).toBe("browser_state.json");
	});

	it("ordering regression: migrates the raw document before the default-value fill-in loop runs", async () => {
		const dbDir = path.join(tempDir, "db");
		fs.mkdirSync(dbDir, { recursive: true });
		// Legacy document: no schemaVersion, and missing "filters", which the
		// default value supplies. If the fill-in loop ran before migration,
		// migrateConfigDocument would receive a document that already has
		// "filters" populated with the four defaults.
		fs.writeFileSync(path.join(dbDir, "browser_state.json"), "{}");

		const receivedDocs: JsonObject[] = [];
		vi.doMock("../functions/migrateConfigDocument.js", async () => {
			const actual = await vi.importActual<
				typeof import("../functions/migrateConfigDocument.js")
			>("../functions/migrateConfigDocument.js");
			return {
				...actual,
				migrateConfigDocument: vi.fn((_key: unknown, doc: JsonObject) => {
					receivedDocs.push(doc);
					// Marker: explicitly set "filters" to empty, distinguishable
					// from both the raw legacy doc (key absent) and the default
					// fill-in (four filters). Only detectable downstream if this
					// return value is what actually gets deserialized.
					return { ...doc, filters: [] };
				}),
			};
		});

		const { browserStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		expect(receivedDocs).toHaveLength(1);
		expect(receivedDocs[0]).not.toHaveProperty("filters");

		expect(browserStateRepository.get().filters).toHaveLength(0);
	});
});
