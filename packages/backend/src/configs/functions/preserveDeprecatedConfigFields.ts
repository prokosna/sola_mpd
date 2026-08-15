import type { Message } from "@bufbuild/protobuf";
import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";

import type { ConfigKey } from "./migrateConfigDocument.js";

type DeprecatedFieldGuard = (incoming: Message, existing: Message) => Message;

// Nothing writes these fields intentionally, so "empty" always means
// "dropped".
const DEPRECATED_FIELD_GUARDS: Partial<
	Record<ConfigKey, DeprecatedFieldGuard>
> = {
	[CONFIG_KEY_COMMON_SONG_TABLE_STATE]: (incoming, existing) => {
		const typedIncoming = incoming as SongTableState;
		const typedExisting = existing as SongTableState;
		return typedIncoming.columns.length === 0 &&
			typedExisting.columns.length > 0
			? { ...typedIncoming, columns: typedExisting.columns }
			: typedIncoming;
	},
	[CONFIG_KEY_BROWSER_STATE]: (incoming, existing) => {
		const typedIncoming = incoming as BrowserState;
		const typedExisting = existing as BrowserState;
		return typedIncoming.filters.length === 0 &&
			typedExisting.filters.length > 0
			? { ...typedIncoming, filters: typedExisting.filters }
			: typedIncoming;
	},
	[CONFIG_KEY_RECENTLY_ADDED_STATE]: (incoming, existing) => {
		const typedIncoming = incoming as RecentlyAddedState;
		const typedExisting = existing as RecentlyAddedState;
		return typedIncoming.filters.length === 0 &&
			typedExisting.filters.length > 0
			? { ...typedIncoming, filters: typedExisting.filters }
			: typedIncoming;
	},
	[CONFIG_KEY_SAVED_SEARCHES]: (incoming, existing) => {
		const typedIncoming = incoming as SavedSearches;
		const typedExisting = existing as SavedSearches;
		return {
			...typedIncoming,
			searches: typedIncoming.searches.map((search) => {
				const existingSearch = typedExisting.searches.find(
					(candidate) => candidate.name === search.name,
				);
				if (
					search.columns.length > 0 ||
					existingSearch === undefined ||
					existingSearch.columns.length === 0
				) {
					return search;
				}
				return { ...search, columns: existingSearch.columns };
			}),
		};
	},
};

// A save replaces the whole document, so an empty legacy field on `incoming`
// is indistinguishable from an intentional clear; restore it from `existing`
// (the on-disk document) instead.
export function preserveDeprecatedConfigFields<T extends Message>(
	key: ConfigKey,
	incoming: T,
	existing: T,
): T {
	const guard = DEPRECATED_FIELD_GUARDS[key];
	if (guard === undefined) {
		return incoming;
	}
	return guard(incoming, existing) as T;
}
