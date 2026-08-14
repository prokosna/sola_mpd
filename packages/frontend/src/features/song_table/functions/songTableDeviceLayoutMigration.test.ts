import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import { DEFAULT_COLUMN_WIDTH_FLEX } from "../const/songTableDefaults";
import { composeSongTableColumnView } from "./songTableColumnView";
import {
	buildDeviceLayoutFromServerColumns,
	convertLegacySongTableColumnLayout,
	type LegacySongTableColumnLayout,
	migrateSongTableDeviceLayout,
} from "./songTableDeviceLayoutMigration";

describe("convertLegacySongTableColumnLayout", () => {
	it("converts width and ordered sort per tag", () => {
		const legacy: LegacySongTableColumnLayout = {
			[String(Song_MetadataTag.TITLE)]: {
				widthFlex: 150,
				sortOrder: 1,
				isSortDesc: true,
			},
			[String(Song_MetadataTag.ARTIST)]: {
				widthFlex: 100,
				sortOrder: 0,
				isSortDesc: false,
			},
		};

		const result = convertLegacySongTableColumnLayout(legacy);

		expect(result.widthFlexByTag).toEqual({
			[Song_MetadataTag.TITLE]: 150,
			[Song_MetadataTag.ARTIST]: 100,
		});
		expect(result.sort).toEqual([
			{ tag: Song_MetadataTag.ARTIST, isDesc: false },
			{ tag: Song_MetadataTag.TITLE, isDesc: true },
		]);
	});

	it("drops a stale key that is no longer a valid tag", () => {
		const legacy: LegacySongTableColumnLayout = {
			"99999": { widthFlex: 100, isSortDesc: false },
			[String(Song_MetadataTag.TITLE)]: { widthFlex: 150, isSortDesc: false },
		};

		const result = convertLegacySongTableColumnLayout(legacy);

		expect(result.widthFlexByTag).toEqual({ [Song_MetadataTag.TITLE]: 150 });
	});

	it("omits a tag with no sort order from the sort list", () => {
		const legacy: LegacySongTableColumnLayout = {
			[String(Song_MetadataTag.TITLE)]: { widthFlex: 150, isSortDesc: false },
		};

		expect(convertLegacySongTableColumnLayout(legacy).sort).toEqual([]);
	});

	// A stored zero is not a width (R1): importing it would render the
	// column at flex 0 instead of composing to the default.
	it("produces no widthFlexByTag key for an entry with widthFlex 0", () => {
		const legacy: LegacySongTableColumnLayout = {
			[String(Song_MetadataTag.TITLE)]: { widthFlex: 0, isSortDesc: false },
		};

		const result = convertLegacySongTableColumnLayout(legacy);

		expect(result.widthFlexByTag).toEqual({});
		expect(
			composeSongTableColumnView([Song_MetadataTag.TITLE], result)[0].widthFlex,
		).toBe(DEFAULT_COLUMN_WIDTH_FLEX);
	});
});

describe("buildDeviceLayoutFromServerColumns", () => {
	it("captures width and ordered sort per column", () => {
		const columns = [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.ARTIST,
				widthFlex: 100,
				sortOrder: 1,
				isSortDesc: false,
			}),
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				widthFlex: 150,
				sortOrder: 0,
				isSortDesc: true,
			}),
		];

		const result = buildDeviceLayoutFromServerColumns(columns);

		expect(result.widthFlexByTag).toEqual({
			[Song_MetadataTag.ARTIST]: 100,
			[Song_MetadataTag.TITLE]: 150,
		});
		expect(result.sort).toEqual([
			{ tag: Song_MetadataTag.TITLE, isDesc: true },
			{ tag: Song_MetadataTag.ARTIST, isDesc: false },
		]);
	});

	// A stored zero is not a width (R1): a column averaged down to flex 0
	// before this refactor must not survive the migration as a fixed width.
	it("produces no widthFlexByTag key for a column with widthFlex 0", () => {
		const columns = [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				widthFlex: 0,
				isSortDesc: false,
			}),
		];

		const result = buildDeviceLayoutFromServerColumns(columns);

		expect(result.widthFlexByTag).toEqual({});
		expect(
			composeSongTableColumnView([Song_MetadataTag.TITLE], result)[0].widthFlex,
		).toBe(DEFAULT_COLUMN_WIDTH_FLEX);
	});
});

describe("migrateSongTableDeviceLayout", () => {
	it("uses the legacy device layout without touching the server when present", async () => {
		const legacy: LegacySongTableColumnLayout = {
			[String(Song_MetadataTag.TITLE)]: { widthFlex: 150, isSortDesc: false },
		};
		const fetchServerColumns = async () => {
			throw new Error("must not be called when a legacy layout exists");
		};

		const result = await migrateSongTableDeviceLayout(
			legacy,
			fetchServerColumns,
		);

		expect(result).toEqual({
			status: "migrated",
			layout: convertLegacySongTableColumnLayout(legacy),
		});
	});

	// The async ordering is load-bearing (DESIGN.md §7): a device with no
	// local key must wait for a slow backend fetch and end up with the
	// server's values, not the defaults.
	it("waits for a slow backend fetch and resolves to the server's values, not the defaults", async () => {
		const serverColumns = [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				widthFlex: 321,
				sortOrder: 0,
				isSortDesc: true,
			}),
		];
		let resolveFetch: (() => void) | undefined;
		const fetchServerColumns = () =>
			new Promise<typeof serverColumns>((resolve) => {
				resolveFetch = () => resolve(serverColumns);
			});

		const resultPromise = migrateSongTableDeviceLayout(
			undefined,
			fetchServerColumns,
		);

		// The fetch has not settled yet; the promise must still be pending.
		let settled = false;
		resultPromise.then(() => {
			settled = true;
		});
		await Promise.resolve();
		expect(settled).toBe(false);

		resolveFetch?.();
		const result = await resultPromise;

		expect(result).toEqual({
			status: "migrated",
			layout: buildDeviceLayoutFromServerColumns(serverColumns),
		});
	});

	it("resolves to 'failed' without throwing when the backend fetch fails", async () => {
		const fetchServerColumns = async (): Promise<never> => {
			throw new Error("network error");
		};

		const result = await migrateSongTableDeviceLayout(
			undefined,
			fetchServerColumns,
		);

		expect(result).toEqual({ status: "failed" });
	});
});
