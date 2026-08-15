import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

/**
 * What a filter panel renders: one workspace tag with the URL-derived
 * selection overlaid. Not a persisted shape — `BrowserFilter`'s
 * `selected_values` / `selected_order` / `order` are deprecated and this type
 * has no equivalents; array position is the only order there is.
 */
export type BrowserFilterView = {
	tag: Song_MetadataTag;
	selectedValues: string[];
};
