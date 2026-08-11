import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import type {
	BrowserSelection,
	SerializedBrowserSelection,
} from "../types/browserSelection";

// Settled decision, not a tuning knob: above this many characters the value
// moves from the URL to a
// server-side View State Blob, referenced by a short token instead.
const INLINE_LENGTH_LIMIT = 2000;

/**
 * Encodes a selection as compact `[tag, values][]` tuples. Shared by the
 * inline and blob paths: a blob's payload is exactly this same string, only
 * stored server-side instead of embedded in the URL, so `decodeBrowserSelectionValue`
 * below is the single decoder for both.
 */
export function encodeBrowserSelection(selection: BrowserSelection): string {
	const meaningful = selection.filter((entry) => entry.values.length > 0);
	return JSON.stringify(meaningful.map((entry) => [entry.tag, entry.values]));
}

function isEncodedEntry(value: unknown): value is [number, string[]] {
	return (
		Array.isArray(value) &&
		value.length === 2 &&
		typeof value[0] === "number" &&
		Array.isArray(value[1]) &&
		value[1].every((item) => typeof item === "string")
	);
}

/**
 * Inverse of `encodeBrowserSelection`. Never throws: a value that fails to
 * parse or match the expected shape (corrupted cache entry, hand-edited URL,
 * token payload from an unrelated feature) degrades to an empty selection
 * rather than breaking the page.
 */
export function decodeBrowserSelectionValue(value: string): BrowserSelection {
	let parsed: unknown;
	try {
		parsed = JSON.parse(value);
	} catch {
		return [];
	}
	if (!Array.isArray(parsed) || !parsed.every(isEncodedEntry)) {
		return [];
	}
	return parsed.map(([tag, values]) => ({
		tag: tag as Song_MetadataTag,
		values,
	}));
}

/**
 * Pure, synchronous decision: does the selection fit inline in the URL, or
 * must the caller save it as a View State Blob first? Performs no I/O:
 * `functions` must stay pure.
 */
export function serializeBrowserSelection(
	selection: BrowserSelection,
): SerializedBrowserSelection {
	const value = encodeBrowserSelection(selection);
	if (value.length > INLINE_LENGTH_LIMIT) {
		return { kind: "blob", payload: value };
	}
	return { kind: "inline", value };
}
