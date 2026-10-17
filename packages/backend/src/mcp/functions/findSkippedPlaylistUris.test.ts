import { describe, expect, it } from "vitest";

import { findSkippedPlaylistUris } from "./findSkippedPlaylistUris.js";

describe("findSkippedPlaylistUris", () => {
	it("returns nothing when every entry was appended", () => {
		expect(findSkippedPlaylistUris(["a", "b"], ["a", "b"])).toEqual([]);
	});

	it("returns the entries missing from the appended songs, in order", () => {
		expect(
			findSkippedPlaylistUris(["a", "gone", "b", "lost"], ["a", "b"]),
		).toEqual(["gone", "lost"]);
	});

	it("keeps duplicates apart when only one copy was appended", () => {
		expect(findSkippedPlaylistUris(["a", "x", "a"], ["a", "a"])).toEqual(["x"]);
		expect(findSkippedPlaylistUris(["a", "a"], ["a"])).toEqual(["a"]);
	});

	it("returns every entry when nothing was appended", () => {
		expect(findSkippedPlaylistUris(["a", "b"], [])).toEqual(["a", "b"]);
	});
});
