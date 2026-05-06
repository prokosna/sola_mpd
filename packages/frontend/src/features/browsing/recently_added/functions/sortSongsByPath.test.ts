import { create } from "@bufbuild/protobuf";
import { type Song, SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { sortSongsByPath } from "./sortSongsByPath";

function makeSong(path: string): Song {
	return create(SongSchema, { path });
}

describe("sortSongsByPath", () => {
	it("returns songs sorted by path ascending", () => {
		const songs = [
			makeSong("b/2.mp3"),
			makeSong("a/1.mp3"),
			makeSong("a/2.mp3"),
		];

		const result = sortSongsByPath(songs);

		expect(result.map((s) => s.path)).toEqual([
			"a/1.mp3",
			"a/2.mp3",
			"b/2.mp3",
		]);
	});

	it("does not mutate the input array", () => {
		const songs = [makeSong("c.mp3"), makeSong("a.mp3"), makeSong("b.mp3")];
		const original = songs.map((s) => s.path);

		sortSongsByPath(songs);

		expect(songs.map((s) => s.path)).toEqual(original);
	});

	it("preserves order for equal paths", () => {
		const a1 = makeSong("a.mp3");
		const a2 = makeSong("a.mp3");
		const b = makeSong("b.mp3");

		const result = sortSongsByPath([b, a1, a2]);

		expect(result[0]).toBe(a1);
		expect(result[1]).toBe(a2);
		expect(result[2]).toBe(b);
	});

	it("returns an empty array unchanged", () => {
		expect(sortSongsByPath([])).toEqual([]);
	});
});
