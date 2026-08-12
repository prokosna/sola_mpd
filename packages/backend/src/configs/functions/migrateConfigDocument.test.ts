import { fromJson, type JsonObject } from "@bufbuild/protobuf";
import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import {
	CONFIG_MIGRATION_CHAINS,
	type ConfigMigrationChainTable,
	getConfigDocumentCurrentVersion,
	migrateConfigDocument,
} from "./migrateConfigDocument.js";

describe("migrateConfigDocument", () => {
	it("leaves the document unchanged when the chain is empty", () => {
		const doc: JsonObject = { schemaVersion: 1, profiles: [] };

		const result = migrateConfigDocument(CONFIG_KEY_MPD_PROFILE_STATE, doc);

		expect(result).toEqual(doc);
	});

	it.each([
		undefined,
		0,
		1,
	])("treats schemaVersion %s as version 1", (schemaVersion) => {
		const doc: JsonObject =
			schemaVersion === undefined
				? { profiles: [] }
				: { schemaVersion, profiles: [] };

		expect(getConfigDocumentCurrentVersion(CONFIG_KEY_MPD_PROFILE_STATE)).toBe(
			1,
		);
		expect(migrateConfigDocument(CONFIG_KEY_MPD_PROFILE_STATE, doc)).toEqual(
			doc,
		);
	});

	it("runs an injected non-empty chain against a document with no schemaVersion", () => {
		const chains: ConfigMigrationChainTable = {
			...CONFIG_MIGRATION_CHAINS,
			[CONFIG_KEY_BROWSER_STATE]: [
				(doc: JsonObject) => ({ ...doc, migratedFromV1: true }),
			],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_BROWSER_STATE,
			{ filters: [] },
			chains,
		);

		expect(result).toEqual({ filters: [], migratedFromV1: true });
		expect(
			getConfigDocumentCurrentVersion(CONFIG_KEY_BROWSER_STATE, chains),
		).toBe(2);
	});

	it("chains multiple migrations in order across versions", () => {
		const chains: ConfigMigrationChainTable = {
			...CONFIG_MIGRATION_CHAINS,
			[CONFIG_KEY_BROWSER_STATE]: [
				(doc: JsonObject) => ({
					...doc,
					steps: [...(doc.steps as number[]), 1],
				}),
				(doc: JsonObject) => ({
					...doc,
					steps: [...(doc.steps as number[]), 2],
				}),
			],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_BROWSER_STATE,
			{ steps: [] },
			chains,
		);

		expect(result).toEqual({ steps: [1, 2] });
	});

	it("only runs the remaining migrations when starting from a mid-chain version", () => {
		const chains: ConfigMigrationChainTable = {
			...CONFIG_MIGRATION_CHAINS,
			[CONFIG_KEY_BROWSER_STATE]: [
				(doc: JsonObject) => ({
					...doc,
					steps: [...(doc.steps as number[]), 1],
				}),
				(doc: JsonObject) => ({
					...doc,
					steps: [...(doc.steps as number[]), 2],
				}),
			],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_BROWSER_STATE,
			{ schemaVersion: 2, steps: [] },
			chains,
		);

		expect(result).toEqual({ schemaVersion: 2, steps: [2] });
	});
});

describe("common_song_table_state v1 -> v2", () => {
	it("derives columnTags from columns and leaves columns in place", () => {
		const doc: JsonObject = {
			columns: [
				{ tag: "TITLE", widthFlex: 1 },
				{ tag: "ARTIST", widthFlex: 1 },
				{ tag: "ALBUM", widthFlex: 1 },
			],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_COMMON_SONG_TABLE_STATE,
			doc,
		);

		expect(result).toEqual({
			columns: doc.columns,
			columnTags: ["TITLE", "ARTIST", "ALBUM"],
		});
	});

	it("leaves an already-v2 document untouched", () => {
		const doc: JsonObject = {
			schemaVersion: 2,
			columns: [{ tag: "TITLE", widthFlex: 1 }],
			columnTags: ["TITLE"],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_COMMON_SONG_TABLE_STATE,
			doc,
		);

		expect(result).toEqual(doc);
	});

	it("does not crash when columns is missing or empty", () => {
		expect(
			migrateConfigDocument(CONFIG_KEY_COMMON_SONG_TABLE_STATE, {}),
		).toEqual({ columnTags: [] });
		expect(
			migrateConfigDocument(CONFIG_KEY_COMMON_SONG_TABLE_STATE, {
				columns: [],
			}),
		).toEqual({ columns: [], columnTags: [] });
	});

	it("skips a legacy column with no tag and round-trips through fromJson", () => {
		const doc: JsonObject = {
			columns: [{ widthFlex: 1 }, { tag: "TITLE", widthFlex: 1 }],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_COMMON_SONG_TABLE_STATE,
			doc,
		);

		expect(result.columnTags).toEqual(["TITLE"]);
		expect(() =>
			fromJson(SongTableStateSchema, { ...result, schemaVersion: 2 }),
		).not.toThrow();
	});
});

describe("browser_state v1 -> v2", () => {
	it("derives filterTags from filters ordered by the legacy order field", () => {
		const doc: JsonObject = {
			filters: [
				{ tag: "COMPOSER", order: 3, selectedOrder: -1 },
				{ tag: "GENRE", order: 0, selectedOrder: -1 },
				{ tag: "ARTIST", order: 1, selectedOrder: -1 },
				{ tag: "ALBUM", order: 2, selectedOrder: -1 },
			],
		};

		const result = migrateConfigDocument(CONFIG_KEY_BROWSER_STATE, doc);

		expect(result).toEqual({
			filters: doc.filters,
			filterTags: ["GENRE", "ARTIST", "ALBUM", "COMPOSER"],
		});
	});

	it("leaves an already-v2 document untouched", () => {
		const doc: JsonObject = {
			schemaVersion: 2,
			filters: [{ tag: "GENRE", order: 0, selectedOrder: -1 }],
			filterTags: ["GENRE"],
		};

		const result = migrateConfigDocument(CONFIG_KEY_BROWSER_STATE, doc);

		expect(result).toEqual(doc);
	});

	it("does not crash when filters is missing or empty", () => {
		expect(migrateConfigDocument(CONFIG_KEY_BROWSER_STATE, {})).toEqual({
			filterTags: [],
		});
		expect(
			migrateConfigDocument(CONFIG_KEY_BROWSER_STATE, { filters: [] }),
		).toEqual({ filters: [], filterTags: [] });
	});

	it("skips a legacy filter with no tag and round-trips through fromJson", () => {
		const doc: JsonObject = {
			filters: [
				{ order: 0, selectedOrder: -1 },
				{ tag: "GENRE", order: 1, selectedOrder: -1 },
			],
		};

		const result = migrateConfigDocument(CONFIG_KEY_BROWSER_STATE, doc);

		expect(result.filterTags).toEqual(["GENRE"]);
		expect(() =>
			fromJson(BrowserStateSchema, { ...result, schemaVersion: 2 }),
		).not.toThrow();
	});
});

describe("recently_added_state v1 -> v2", () => {
	it("derives filterTags from filters in array order", () => {
		const doc: JsonObject = {
			filters: [{ tag: "ALBUM" }, { tag: "ARTIST" }, { tag: "COMPOSER" }],
		};

		const result = migrateConfigDocument(CONFIG_KEY_RECENTLY_ADDED_STATE, doc);

		expect(result).toEqual({
			filters: doc.filters,
			filterTags: ["ALBUM", "ARTIST", "COMPOSER"],
		});
	});

	it("leaves an already-v2 document untouched", () => {
		const doc: JsonObject = {
			schemaVersion: 2,
			filters: [{ tag: "ALBUM" }],
			filterTags: ["ALBUM"],
		};

		const result = migrateConfigDocument(CONFIG_KEY_RECENTLY_ADDED_STATE, doc);

		expect(result).toEqual(doc);
	});

	it("does not crash when filters is missing or empty", () => {
		expect(migrateConfigDocument(CONFIG_KEY_RECENTLY_ADDED_STATE, {})).toEqual({
			filterTags: [],
		});
		expect(
			migrateConfigDocument(CONFIG_KEY_RECENTLY_ADDED_STATE, {
				filters: [],
			}),
		).toEqual({ filters: [], filterTags: [] });
	});

	it("skips a legacy filter with no tag and round-trips through fromJson", () => {
		const doc: JsonObject = { filters: [{}, { tag: "ALBUM" }] };

		const result = migrateConfigDocument(CONFIG_KEY_RECENTLY_ADDED_STATE, doc);

		expect(result.filterTags).toEqual(["ALBUM"]);
		expect(() =>
			fromJson(RecentlyAddedStateSchema, { ...result, schemaVersion: 2 }),
		).not.toThrow();
	});
});

describe("saved_searches v1 -> v2", () => {
	it("derives each search's columnTags and sort from its columns", () => {
		const doc: JsonObject = {
			searches: [
				{
					name: "Test Search",
					columns: [
						{ tag: "TITLE" },
						{ tag: "ARTIST" },
						{ tag: "ALBUM", sortOrder: 0 },
						{ tag: "ADDED_AT" },
					],
				},
				{
					name: "Test2",
					columns: [
						{ tag: "TITLE" },
						{ tag: "ARTIST" },
						{ tag: "ALBUM" },
						{ tag: "ADDED_AT", sortOrder: 0, isSortDesc: true },
					],
				},
			],
		};

		const result = migrateConfigDocument(CONFIG_KEY_SAVED_SEARCHES, doc);

		expect(result).toEqual({
			searches: [
				{
					name: "Test Search",
					columns: (doc.searches as JsonObject[])[0].columns,
					columnTags: ["TITLE", "ARTIST", "ALBUM", "ADDED_AT"],
					sort: [{ tag: "ALBUM", isDesc: false }],
				},
				{
					name: "Test2",
					columns: (doc.searches as JsonObject[])[1].columns,
					columnTags: ["TITLE", "ARTIST", "ALBUM", "ADDED_AT"],
					sort: [{ tag: "ADDED_AT", isDesc: true }],
				},
			],
		});
	});

	it("orders sort by sortOrder when multiple columns carry one", () => {
		const doc: JsonObject = {
			searches: [
				{
					name: "Multi-sort",
					columns: [
						{ tag: "ALBUM", sortOrder: 1, isSortDesc: false },
						{ tag: "ARTIST", sortOrder: 0, isSortDesc: true },
					],
				},
			],
		};

		const result = migrateConfigDocument(CONFIG_KEY_SAVED_SEARCHES, doc);

		expect(((result.searches as JsonObject[])[0] as JsonObject).sort).toEqual([
			{ tag: "ARTIST", isDesc: true },
			{ tag: "ALBUM", isDesc: false },
		]);
	});

	it("leaves an already-v2 document untouched", () => {
		const doc: JsonObject = {
			schemaVersion: 2,
			searches: [
				{
					name: "Test",
					columns: [{ tag: "TITLE" }],
					columnTags: ["TITLE"],
					sort: [],
				},
			],
		};

		const result = migrateConfigDocument(CONFIG_KEY_SAVED_SEARCHES, doc);

		expect(result).toEqual(doc);
	});

	it("does not crash when searches or columns is missing or empty", () => {
		expect(migrateConfigDocument(CONFIG_KEY_SAVED_SEARCHES, {})).toEqual({
			searches: [],
		});
		expect(
			migrateConfigDocument(CONFIG_KEY_SAVED_SEARCHES, {
				searches: [{ name: "Empty" }],
			}),
		).toEqual({
			searches: [{ name: "Empty", columnTags: [], sort: [] }],
		});
	});

	it("skips a legacy column with no tag, from both columnTags and sort, and round-trips through fromJson", () => {
		const doc: JsonObject = {
			searches: [
				{
					name: "Test",
					columns: [
						{ widthFlex: 1 },
						{ tag: "TITLE" },
						{ sortOrder: 0, isSortDesc: true },
					],
				},
			],
		};

		const result = migrateConfigDocument(CONFIG_KEY_SAVED_SEARCHES, doc);

		const search = (result.searches as JsonObject[])[0] as JsonObject;
		expect(search.columnTags).toEqual(["TITLE"]);
		expect(search.sort).toEqual([]);
		expect(() =>
			fromJson(SavedSearchesSchema, { ...result, schemaVersion: 2 }),
		).not.toThrow();
	});
});
