import { create } from "@bufbuild/protobuf";
import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { MpdProfileStateSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import { preserveDeprecatedConfigFields } from "./preserveDeprecatedConfigFields.js";

describe("preserveDeprecatedConfigFields", () => {
	it("common_song_table_state: restores columns when incoming drops them", () => {
		const existing = create(SongTableStateSchema, {
			schemaVersion: 2,
			columns: [{ tag: Song_MetadataTag.TITLE, widthFlex: 1 }],
			columnTags: [Song_MetadataTag.TITLE],
		});
		const incoming = create(SongTableStateSchema, {
			schemaVersion: 2,
			columns: [],
			columnTags: [Song_MetadataTag.ARTIST],
		});

		const result = preserveDeprecatedConfigFields(
			CONFIG_KEY_COMMON_SONG_TABLE_STATE,
			incoming,
			existing,
		);

		expect(result.columns).toEqual(existing.columns);
		expect(result.columnTags).toEqual([Song_MetadataTag.ARTIST]);
	});

	it("common_song_table_state: leaves columns untouched when incoming already has them", () => {
		const existing = create(SongTableStateSchema, {
			schemaVersion: 2,
			columns: [{ tag: Song_MetadataTag.TITLE, widthFlex: 1 }],
		});
		const incoming = create(SongTableStateSchema, {
			schemaVersion: 2,
			columns: [{ tag: Song_MetadataTag.ARTIST, widthFlex: 2 }],
		});

		const result = preserveDeprecatedConfigFields(
			CONFIG_KEY_COMMON_SONG_TABLE_STATE,
			incoming,
			existing,
		);

		expect(result.columns).toEqual(incoming.columns);
	});

	it("browser_state: restores filters when incoming drops them", () => {
		const existing = create(BrowserStateSchema, {
			schemaVersion: 2,
			filters: [{ tag: Song_MetadataTag.GENRE, order: 0, selectedOrder: -1 }],
			filterTags: [Song_MetadataTag.GENRE],
		});
		const incoming = create(BrowserStateSchema, {
			schemaVersion: 2,
			filters: [],
			filterTags: [Song_MetadataTag.ARTIST],
		});

		const result = preserveDeprecatedConfigFields(
			CONFIG_KEY_BROWSER_STATE,
			incoming,
			existing,
		);

		expect(result.filters).toEqual(existing.filters);
		expect(result.filterTags).toEqual([Song_MetadataTag.ARTIST]);
	});

	it("recently_added_state: restores filters when incoming drops them", () => {
		const existing = create(RecentlyAddedStateSchema, {
			schemaVersion: 2,
			filters: [{ tag: Song_MetadataTag.ALBUM }],
			filterTags: [Song_MetadataTag.ALBUM],
		});
		const incoming = create(RecentlyAddedStateSchema, {
			schemaVersion: 2,
			filters: [],
			filterTags: [Song_MetadataTag.ARTIST],
		});

		const result = preserveDeprecatedConfigFields(
			CONFIG_KEY_RECENTLY_ADDED_STATE,
			incoming,
			existing,
		);

		expect(result.filters).toEqual(existing.filters);
		expect(result.filterTags).toEqual([Song_MetadataTag.ARTIST]);
	});

	it("saved_searches: restores each search's columns by matching search name", () => {
		const existing = create(SavedSearchesSchema, {
			schemaVersion: 2,
			searches: [
				{ name: "A", columns: [{ tag: Song_MetadataTag.TITLE }] },
				{ name: "B", columns: [{ tag: Song_MetadataTag.ARTIST }] },
			],
		});
		const incoming = create(SavedSearchesSchema, {
			schemaVersion: 2,
			searches: [
				{ name: "A", columns: [], columnTags: [Song_MetadataTag.ALBUM] },
				{
					name: "B",
					columns: [{ tag: Song_MetadataTag.COMPOSER }],
				},
			],
		});

		const result = preserveDeprecatedConfigFields(
			CONFIG_KEY_SAVED_SEARCHES,
			incoming,
			existing,
		);

		expect(result.searches[0]?.columns).toEqual(existing.searches[0]?.columns);
		expect(result.searches[1]?.columns).toEqual(incoming.searches[1]?.columns);
	});

	it("saved_searches: matches by name rather than position, so a deleted earlier search does not misattribute columns", () => {
		const existing = create(SavedSearchesSchema, {
			schemaVersion: 2,
			searches: [
				{ name: "A", columns: [{ tag: Song_MetadataTag.TITLE }] },
				{ name: "B", columns: [{ tag: Song_MetadataTag.ARTIST }] },
			],
		});
		// "A" was deleted, so "B" is now at index 0 — matching by index would
		// restore "A"'s columns onto it instead of its own.
		const incoming = create(SavedSearchesSchema, {
			schemaVersion: 2,
			searches: [
				{ name: "B", columns: [], columnTags: [Song_MetadataTag.COMPOSER] },
			],
		});

		const result = preserveDeprecatedConfigFields(
			CONFIG_KEY_SAVED_SEARCHES,
			incoming,
			existing,
		);

		expect(result.searches[0]?.columns).toEqual(existing.searches[1]?.columns);
	});

	it("saved_searches: does not crash when incoming has more searches than existing", () => {
		const existing = create(SavedSearchesSchema, {
			schemaVersion: 2,
			searches: [],
		});
		const incoming = create(SavedSearchesSchema, {
			schemaVersion: 2,
			searches: [{ name: "New", columns: [] }],
		});

		const result = preserveDeprecatedConfigFields(
			CONFIG_KEY_SAVED_SEARCHES,
			incoming,
			existing,
		);

		expect(result.searches).toEqual(incoming.searches);
	});

	it("passes the document through unchanged for keys with no guard", () => {
		const existing = create(MpdProfileStateSchema, {
			schemaVersion: 1,
			profiles: [],
		});
		const incoming = create(MpdProfileStateSchema, {
			schemaVersion: 1,
			profiles: [],
		});

		const result = preserveDeprecatedConfigFields(
			CONFIG_KEY_MPD_PROFILE_STATE,
			incoming,
			existing,
		);

		expect(result).toBe(incoming);
	});
});
