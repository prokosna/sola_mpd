import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	type Song,
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { SubsonicSong } from "../types.js";
import { diffSongs } from "./subsonicFunctions.js";

const createSong = (title: string, artist: string, album: string): Song => {
	return create(SongSchema, {
		metadata: {
			[Song_MetadataTag.TITLE]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: title }),
				},
			}),
			[Song_MetadataTag.ARTIST]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: artist }),
				},
			}),
			[Song_MetadataTag.ALBUM]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: album }),
				},
			}),
		},
	});
};

const createSubsonicSong = (
	title: string,
	artist: string,
	album: string,
): SubsonicSong => ({
	id: "1",
	title,
	artist,
	album,
});

describe("diffSongs", () => {
	it("returns empty array when target and existing songs match exactly", () => {
		const targets = [createSong("A", "Artist1", "Album1")];
		const existing = [createSubsonicSong("A", "Artist1", "Album1")];

		const result = diffSongs(targets, existing);

		expect(result).toEqual([]);
	});

	it("returns new songs when targets extend existing songs", () => {
		const song1 = createSong("A", "Artist1", "Album1");
		const song2 = createSong("B", "Artist2", "Album2");
		const targets = [song1, song2];
		const existing = [createSubsonicSong("A", "Artist1", "Album1")];

		const result = diffSongs(targets, existing);

		expect(result).toHaveLength(1);
		expect(result).toEqual([song2]);
	});

	it("returns undefined when existing songs don't match target songs", () => {
		const targets = [createSong("A", "Artist1", "Album1")];
		const existing = [createSubsonicSong("B", "Artist2", "Album2")];

		const result = diffSongs(targets, existing);

		expect(result).toBeUndefined();
	});

	it("returns undefined when existing has more songs than target", () => {
		const targets = [createSong("A", "Artist1", "Album1")];
		const existing = [
			createSubsonicSong("A", "Artist1", "Album1"),
			createSubsonicSong("B", "Artist2", "Album2"),
		];

		const result = diffSongs(targets, existing);

		expect(result).toBeUndefined();
	});

	it("returns all target songs when existing is empty", () => {
		const song1 = createSong("A", "Artist1", "Album1");
		const targets = [song1];
		const existing: SubsonicSong[] = [];

		const result = diffSongs(targets, existing);

		expect(result).toEqual([song1]);
	});

	it("returns empty array when both arrays are empty", () => {
		const result = diffSongs([], []);

		expect(result).toEqual([]);
	});

	it("returns undefined when a song in the middle doesn't match", () => {
		const targets = [
			createSong("A", "Artist1", "Album1"),
			createSong("B", "Artist2", "Album2"),
		];
		const existing = [
			createSubsonicSong("A", "Artist1", "Album1"),
			createSubsonicSong("C", "Artist3", "Album3"),
		];

		const result = diffSongs(targets, existing);

		expect(result).toBeUndefined();
	});

	it("returns undefined when only artist differs", () => {
		const targets = [createSong("A", "Artist1", "Album1")];
		const existing = [createSubsonicSong("A", "DifferentArtist", "Album1")];

		const result = diffSongs(targets, existing);

		expect(result).toBeUndefined();
	});

	it("returns undefined when only album differs", () => {
		const targets = [createSong("A", "Artist1", "Album1")];
		const existing = [createSubsonicSong("A", "Artist1", "DifferentAlbum")];

		const result = diffSongs(targets, existing);

		expect(result).toBeUndefined();
	});
});
