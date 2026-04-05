import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { SongTableKeyType } from "../types/songTableTypes";
import { convertOrderingToOperations } from "./songTableOrdering";

function createSong(path: string, id: string) {
	return create(SongSchema, {
		path,
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

describe("songTableOrdering", () => {
	describe("convertOrderingToOperations", () => {
		it("should return empty operations when order is unchanged", () => {
			const songs = [createSong("/a.mp3", "1"), createSong("/b.mp3", "2")];
			const result = convertOrderingToOperations(
				songs,
				songs,
				SongTableKeyType.PATH,
			);
			expect(result).toEqual([]);
		});

		it("should return operations for reordered songs", () => {
			const songA = createSong("/a.mp3", "1");
			const songB = createSong("/b.mp3", "2");
			const current = [songA, songB];
			const ordered = [songB, songA];
			const result = convertOrderingToOperations(
				current,
				ordered,
				SongTableKeyType.PATH,
			);
			expect(result).toEqual([
				{ id: "2", to: 0 },
				{ id: "1", to: 1 },
			]);
		});

		it("should only return operations for positions that changed", () => {
			const songA = createSong("/a.mp3", "1");
			const songB = createSong("/b.mp3", "2");
			const songC = createSong("/c.mp3", "3");
			const current = [songA, songB, songC];
			const ordered = [songA, songC, songB];
			const result = convertOrderingToOperations(
				current,
				ordered,
				SongTableKeyType.PATH,
			);
			expect(result).toEqual([
				{ id: "3", to: 1 },
				{ id: "2", to: 2 },
			]);
		});
	});
});
