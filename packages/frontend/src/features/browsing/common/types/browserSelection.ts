import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

/**
 * A navigation position for the Browser / Recently Added filter panels: which
 * values are selected for a tag, string-typed to match how selections are
 * already handled throughout the browsing feature (see
 * `selectBrowserFilterValues` in `functions/browserFilter.ts`).
 */
export interface BrowserSelectionEntry {
	tag: Song_MetadataTag;
	values: string[];
}

/**
 * The full navigation position, ordered by selection order (the tag the user
 * picked first comes first). Deliberately excludes tags with no selection —
 * mirrors `selectedOrder`/`selectedValues` on `BrowserFilter` without the
 * proto's "-1 means unselected" placeholder encoding.
 *
 * See docs/design/state-scoping.md §6.2: this is a navigation position, not a
 * setting, so it lives in the URL instead of `BrowserFilter.selected_values`.
 */
export type BrowserSelection = BrowserSelectionEntry[];

/** Decision returned by `serializeBrowserSelection`; the caller acts on it. */
export type SerializedBrowserSelection =
	| { kind: "inline"; value: string }
	// Serialized value exceeded the inline length limit; the caller must save
	// it as a View State Blob and reference it by token instead.
	| { kind: "blob"; payload: string };

/** Decision returned by `deserializeBrowserSelection`; the caller resolves it. */
export type DeserializedBrowserSelection =
	| { kind: "selection"; selection: BrowserSelection }
	// A `?vs=<token>` reference was found; the caller must resolve it via
	// ViewStateBlobRepository.
	| { kind: "token"; token: string };
