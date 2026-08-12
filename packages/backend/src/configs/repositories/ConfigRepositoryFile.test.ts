import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { create, type JsonObject } from "@bufbuild/protobuf";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
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
		expect(written.schemaVersion).toBe(2);
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

describe("ConfigRepositoryFile deprecated field preservation on save", () => {
	let tempDir: string;
	let originalCwd: string;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(
			path.join(os.tmpdir(), "sola-mpd-config-repo-guard-test-"),
		);
		originalCwd = process.cwd();
		process.chdir(tempDir);
		fs.mkdirSync(path.join(tempDir, "db"), { recursive: true });
		vi.resetModules();
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		errorSpy.mockRestore();
		vi.restoreAllMocks();
		process.chdir(originalCwd);
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it("common_song_table_state: restores columns dropped by a save that only sends columnTags", async () => {
		fs.writeFileSync(
			path.join(tempDir, "db", "common_song_table_state.json"),
			JSON.stringify({
				schemaVersion: 2,
				columns: [{ tag: "TITLE", widthFlex: 1 }],
				columnTags: ["TITLE"],
			}),
		);

		const { commonSongTableStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		commonSongTableStateRepository.update(
			create(SongTableStateSchema, {
				schemaVersion: 2,
				columns: [],
				columnTags: [Song_MetadataTag.ARTIST],
			}),
		);

		const result = commonSongTableStateRepository.get();
		expect(result.columns).toEqual([
			expect.objectContaining({ tag: Song_MetadataTag.TITLE }),
		]);
		expect(result.columnTags).toEqual([Song_MetadataTag.ARTIST]);
	});

	it("browser_state: restores filters dropped by a save that only sends filterTags", async () => {
		fs.writeFileSync(
			path.join(tempDir, "db", "browser_state.json"),
			JSON.stringify({
				schemaVersion: 2,
				filters: [{ tag: "GENRE", order: 0, selectedOrder: -1 }],
				filterTags: ["GENRE"],
			}),
		);

		const { browserStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		browserStateRepository.update(
			create(BrowserStateSchema, {
				schemaVersion: 2,
				filters: [],
				filterTags: [Song_MetadataTag.ARTIST],
			}),
		);

		const result = browserStateRepository.get();
		expect(result.filters).toEqual([
			expect.objectContaining({ tag: Song_MetadataTag.GENRE }),
		]);
		expect(result.filterTags).toEqual([Song_MetadataTag.ARTIST]);
	});

	it("recently_added_state: restores filters dropped by a save that only sends filterTags", async () => {
		fs.writeFileSync(
			path.join(tempDir, "db", "recently_added_state.json"),
			JSON.stringify({
				schemaVersion: 2,
				filters: [{ tag: "ALBUM" }],
				filterTags: ["ALBUM"],
			}),
		);

		const { recentlyAddedStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		recentlyAddedStateRepository.update(
			create(RecentlyAddedStateSchema, {
				schemaVersion: 2,
				filters: [],
				filterTags: [Song_MetadataTag.ARTIST],
			}),
		);

		const result = recentlyAddedStateRepository.get();
		expect(result.filters).toEqual([
			expect.objectContaining({ tag: Song_MetadataTag.ALBUM }),
		]);
		expect(result.filterTags).toEqual([Song_MetadataTag.ARTIST]);
	});

	it("saved_searches: restores each search's columns dropped by a save that only sends columnTags", async () => {
		fs.writeFileSync(
			path.join(tempDir, "db", "saved_searches.json"),
			JSON.stringify({
				schemaVersion: 2,
				searches: [
					{
						name: "Test Search",
						columns: [{ tag: "TITLE" }],
						columnTags: ["TITLE"],
					},
				],
			}),
		);

		const { savedSearchRepository } = await import("./ConfigRepositoryFile.js");

		savedSearchRepository.update(
			create(SavedSearchesSchema, {
				schemaVersion: 2,
				searches: [
					{
						name: "Test Search",
						columns: [],
						columnTags: [Song_MetadataTag.ARTIST],
					},
				],
			}),
		);

		const result = savedSearchRepository.get();
		expect(result.searches[0]?.columns).toEqual([
			expect.objectContaining({ tag: Song_MetadataTag.TITLE }),
		]);
		expect(result.searches[0]?.columnTags).toEqual([Song_MetadataTag.ARTIST]);
	});
});

describe("ConfigRepositoryFile default documents", () => {
	let tempDir: string;
	let originalCwd: string;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(
			path.join(os.tmpdir(), "sola-mpd-config-repo-default-test-"),
		);
		originalCwd = process.cwd();
		process.chdir(tempDir);
		vi.resetModules();
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		errorSpy.mockRestore();
		vi.restoreAllMocks();
		process.chdir(originalCwd);
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it("common_song_table_state: a fresh install populates columnTags alongside the legacy columns", async () => {
		const { commonSongTableStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		expect(commonSongTableStateRepository.get().columnTags).toEqual([
			Song_MetadataTag.TITLE,
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.ALBUM,
		]);
	});

	it("browser_state: a fresh install populates filterTags alongside the legacy filters", async () => {
		const { browserStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		expect(browserStateRepository.get().filterTags).toEqual([
			Song_MetadataTag.GENRE,
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.ALBUM,
			Song_MetadataTag.COMPOSER,
		]);
	});

	it("recently_added_state: a fresh install populates filterTags alongside the legacy filters", async () => {
		const { recentlyAddedStateRepository } = await import(
			"./ConfigRepositoryFile.js"
		);

		expect(recentlyAddedStateRepository.get().filterTags).toEqual([
			Song_MetadataTag.ALBUM,
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.COMPOSER,
		]);
	});
});
