import { create } from "@bufbuild/protobuf";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { assignSongIndices } from "./songTableIndex";

describe("songTableIndex", () => {
	describe("assignSongIndices", () => {
		it("should assign sequential indices to songs", () => {
			const songs = [
				create(SongSchema, { path: "a.mp3" }),
				create(SongSchema, { path: "b.mp3" }),
				create(SongSchema, { path: "c.mp3" }),
			];
			const result = assignSongIndices(songs);
			expect(result[0].index).toBe(0);
			expect(result[1].index).toBe(1);
			expect(result[2].index).toBe(2);
		});

		it("should return empty array for empty input", () => {
			expect(assignSongIndices([])).toEqual([]);
		});
	});
});
