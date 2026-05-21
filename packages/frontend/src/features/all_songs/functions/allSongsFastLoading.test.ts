import { create } from "@bufbuild/protobuf";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { type Song, SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { MpdClient } from "../../mpd";
import {
	type AllSongsFastProgress,
	loadAllSongsFast,
} from "./allSongsFastLoading";

const profile = create(MpdProfileSchema, {
	name: "test",
	host: "localhost",
	port: 6600,
});

const mpdClient = {} as MpdClient;

function makeSong(path: string): Song {
	return create(SongSchema, { path });
}

function makeFetchChunk(pages: Song[][]) {
	const calls: Array<{ offset: number; limit: number }> = [];
	const fetch = async (
		_client: MpdClient,
		_profile: typeof profile,
		offset: number,
		limit: number,
	): Promise<Song[]> => {
		calls.push({ offset, limit });
		return pages.shift() ?? [];
	};
	return { fetch, calls };
}

describe("loadAllSongsFast", () => {
	it("issues windows starting at the initial offset and advances by chunk length", async () => {
		const { fetch, calls } = makeFetchChunk([
			[makeSong("/a"), makeSong("/b")],
			[makeSong("/c"), makeSong("/d")],
			[makeSong("/e")],
		]);

		const result = await loadAllSongsFast({
			mpdClient,
			profile,
			initialSongs: [],
			initialOffset: 0,
			chunkSize: 2,
			fetchChunk: fetch,
		});

		expect(calls).toEqual([
			{ offset: 0, limit: 2 },
			{ offset: 2, limit: 2 },
			{ offset: 4, limit: 2 },
		]);
		expect(result.songs.map((s) => s.path)).toEqual([
			"/a",
			"/b",
			"/c",
			"/d",
			"/e",
		]);
		expect(result.offset).toBe(5);
		expect(result.hasMore).toBe(false);
	});

	it("stops on the first short chunk", async () => {
		const { fetch, calls } = makeFetchChunk([[makeSong("/a")]]);

		const result = await loadAllSongsFast({
			mpdClient,
			profile,
			initialSongs: [],
			initialOffset: 0,
			chunkSize: 10,
			fetchChunk: fetch,
		});

		expect(calls).toHaveLength(1);
		expect(result.songs).toHaveLength(1);
		expect(result.hasMore).toBe(false);
	});

	it("treats an empty chunk as the natural end", async () => {
		const { fetch } = makeFetchChunk([[]]);

		const result = await loadAllSongsFast({
			mpdClient,
			profile,
			initialSongs: [makeSong("/seed")],
			initialOffset: 1,
			chunkSize: 5,
			fetchChunk: fetch,
		});

		expect(result.songs.map((s) => s.path)).toEqual(["/seed"]);
		expect(result.offset).toBe(1);
		expect(result.hasMore).toBe(false);
	});

	it("calls onProgress after every chunk with the running accumulator", async () => {
		const { fetch } = makeFetchChunk([
			[makeSong("/a"), makeSong("/b")],
			[makeSong("/c")],
		]);
		const progress: AllSongsFastProgress[] = [];

		await loadAllSongsFast({
			mpdClient,
			profile,
			initialSongs: [],
			initialOffset: 0,
			chunkSize: 2,
			fetchChunk: fetch,
			onProgress: (p) =>
				progress.push({
					songs: [...p.songs],
					offset: p.offset,
					hasMore: p.hasMore,
				}),
		});

		expect(progress).toHaveLength(2);
		expect(progress[0]).toEqual({
			songs: [makeSong("/a"), makeSong("/b")],
			offset: 2,
			hasMore: true,
		});
		expect(progress[1]).toEqual({
			songs: [makeSong("/a"), makeSong("/b"), makeSong("/c")],
			offset: 3,
			hasMore: false,
		});
	});

	it("resumes from initialSongs and initialOffset", async () => {
		const { fetch, calls } = makeFetchChunk([[makeSong("/c")]]);

		const result = await loadAllSongsFast({
			mpdClient,
			profile,
			initialSongs: [makeSong("/a"), makeSong("/b")],
			initialOffset: 2,
			chunkSize: 10,
			fetchChunk: fetch,
		});

		expect(calls[0]).toEqual({ offset: 2, limit: 10 });
		expect(result.songs.map((s) => s.path)).toEqual(["/a", "/b", "/c"]);
		expect(result.offset).toBe(3);
	});

	it("propagates fetch errors", async () => {
		const failingFetch = async () => {
			throw new Error("boom");
		};
		await expect(
			loadAllSongsFast({
				mpdClient,
				profile,
				initialSongs: [],
				initialOffset: 0,
				chunkSize: 1,
				fetchChunk: failingFetch,
			}),
		).rejects.toThrow("boom");
	});
});
