import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";
import type { SongTableContextMenuItemParams } from "../types/songTableTypes";
import { SongTableKeyType } from "../types/songTableTypes";
import {
	convertNodeToSong,
	getSongTableKey,
	getTargetSongsForContextMenu,
} from "./songTableKey";

function createSong(path: string, id: string, index = 0) {
	return create(SongSchema, {
		path,
		index,
		metadata: {
			[Song_MetadataTag.ID]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: id }),
				},
			}),
		},
	});
}

describe("songTableKey", () => {
	describe("getSongTableKey", () => {
		it("should return path for PATH key type", () => {
			const song = createSong("/music/test.mp3", "1");
			expect(getSongTableKey(song, SongTableKeyType.PATH)).toBe(
				"/music/test.mp3",
			);
		});

		it("should return index_path for INDEX_PATH key type", () => {
			const song = createSong("/music/test.mp3", "1", 5);
			expect(getSongTableKey(song, SongTableKeyType.INDEX_PATH)).toBe(
				"5_/music/test.mp3",
			);
		});

		it("should return id for ID key type", () => {
			const song = createSong("/music/test.mp3", "42");
			expect(getSongTableKey(song, SongTableKeyType.ID)).toBe("42");
		});
	});

	describe("convertNodeToSong", () => {
		it("should return song from map by node key", () => {
			const song = createSong("/test.mp3", "1");
			const songsMap = new Map([["key1", song]]);
			const node = { data: { key: "key1" } };
			expect(convertNodeToSong(songsMap, node as never)).toBe(song);
		});

		it("should throw if key is missing", () => {
			const songsMap = new Map<string, never>();
			const node = { data: {} };
			expect(() => convertNodeToSong(songsMap, node as never)).toThrow(
				"Key is not defined",
			);
		});

		it("should throw if song not found in map", () => {
			const songsMap = new Map<string, never>();
			const node = { data: { key: "missing" } };
			expect(() => convertNodeToSong(songsMap, node as never)).toThrow(
				"No song found",
			);
		});
	});

	describe("getTargetSongsForContextMenu", () => {
		it("should return clicked song when not in selection", () => {
			const clicked = createSong("/a.mp3", "1");
			const selected = [createSong("/b.mp3", "2")];
			const params: SongTableContextMenuItemParams = {
				columns: [],
				clickedSong: clicked,
				sortedSongs: [],
				selectedSortedSongs: selected,
			};
			const result = getTargetSongsForContextMenu(
				params,
				SongTableKeyType.PATH,
			);
			expect(result).toEqual([clicked]);
		});

		it("should return selected songs when clicked song is in selection", () => {
			const clicked = createSong("/a.mp3", "1");
			const selected = [clicked, createSong("/b.mp3", "2")];
			const params: SongTableContextMenuItemParams = {
				columns: [],
				clickedSong: clicked,
				sortedSongs: [],
				selectedSortedSongs: selected,
			};
			const result = getTargetSongsForContextMenu(
				params,
				SongTableKeyType.PATH,
			);
			expect(result).toEqual(selected);
		});
	});
});
