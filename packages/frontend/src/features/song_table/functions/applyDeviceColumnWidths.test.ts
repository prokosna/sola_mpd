import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import type { SongTableColumnLayout } from "../types/songTableTypes";
import { applyDeviceColumnWidths } from "./applyDeviceColumnWidths";
import { songTableColumnLayoutKeyForTag } from "./songTableColumnLayout";

function createColumn(tag: Song_MetadataTag, widthFlex: number) {
	return create(SongTableColumnSchema, { tag, isSortDesc: false, widthFlex });
}

describe("applyDeviceColumnWidths", () => {
	it("overlays the device width for a column present in the layout", () => {
		const columns = [createColumn(Song_MetadataTag.TITLE, 100)];
		const layout: SongTableColumnLayout = {
			[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)]: {
				widthFlex: 250,
				isSortDesc: false,
			},
		};

		const result = applyDeviceColumnWidths(columns, layout);

		expect(result[0].widthFlex).toBe(250);
	});

	it("keeps the column's existing width_flex when the device has no entry for it", () => {
		const columns = [createColumn(Song_MetadataTag.TITLE, 100)];

		const result = applyDeviceColumnWidths(columns, {});

		expect(result[0].widthFlex).toBe(100);
	});

	it("falls back to the default flex when the device has no entry and the column carries no width", () => {
		// Saved searches are persisted with width_flex 0 on purpose, so a tag
		// this device has never sized must not render as a fixed-width column.
		const columns = [createColumn(Song_MetadataTag.TITLE, 0)];

		const result = applyDeviceColumnWidths(columns, {});

		expect(result[0].widthFlex).toBe(1);
		expect(columns[0].widthFlex).toBe(0);
	});

	it("does not mutate the input columns", () => {
		const columns = [createColumn(Song_MetadataTag.TITLE, 100)];
		const layout: SongTableColumnLayout = {
			[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)]: {
				widthFlex: 250,
				isSortDesc: false,
			},
		};

		applyDeviceColumnWidths(columns, layout);

		expect(columns[0].widthFlex).toBe(100);
	});
});
