import { create } from "@bufbuild/protobuf";
import {
	type MpdRequest,
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { type Song, SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../mpd/services/MpdClient.js";
import type { LibraryIndex } from "../services/LibraryIndex.js";
import { ensureLibraryIndexUseCase } from "./libraryIndexUseCases.js";

function makeProfile() {
	return create(MpdProfileSchema, {
		name: "test",
		host: "localhost",
		port: 6600,
	});
}

function makeListAllSongsResponse(songs: Song[]): MpdResponse {
	return create(MpdResponseSchema, {
		command: { case: "listAllSongs", value: { songs } },
	});
}

function makeMpdClient(songs: Song[]): MpdClient {
	return {
		execute: vi.fn(async (_req: MpdRequest) => makeListAllSongsResponse(songs)),
		executeBulk: vi.fn(async () => undefined),
		subscribe: vi.fn(async () => () => undefined),
		unsubscribe: vi.fn(async () => true),
	};
}

function makeIndex(refreshReturn = true): LibraryIndex {
	return {
		refreshIfNeeded: vi.fn(() => refreshReturn),
		stats: vi.fn(() => ({
			song_count: 0,
			last_built_at: undefined,
			last_source_signature: undefined,
		})),
		topByTag: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		breakdown: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		formatDistribution: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		decadeBreakdown: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		recentlyAddedByArtist: vi.fn(() => ({
			rows: [],
			distinct_values_seen: 0,
		})),
		artistSummary: vi.fn(() => undefined),
		findArtistCandidates: vi.fn(() => []),
		querySql: vi.fn(() => ({
			columns: [],
			rows: [],
			row_count: 0,
			truncated: false,
		})),
		describe: vi.fn(() => ({ sql_schema: "", notes: "" })),
		close: vi.fn(),
	};
}

describe("ensureLibraryIndexUseCase", () => {
	it("passes the fetched song list to LibraryIndex.refreshIfNeeded", async () => {
		const songs = [create(SongSchema, { path: "a" })];
		const mpdClient = makeMpdClient(songs);
		const libraryIndex = makeIndex(true);

		const result = await ensureLibraryIndexUseCase({
			profile: makeProfile(),
			mpdClient,
			libraryIndex,
		});

		expect(mpdClient.execute).toHaveBeenCalledOnce();
		// MpdResponse.create may wrap the array; verify identity via the spy
		// argument rather than against the input array.
		expect(libraryIndex.refreshIfNeeded).toHaveBeenCalledOnce();
		const refreshArg = (
			libraryIndex.refreshIfNeeded as ReturnType<typeof vi.fn>
		).mock.calls[0][0];
		expect(result.songs).toBe(refreshArg);
		expect(result.songs).toEqual(songs);
		expect(result.rebuilt).toBe(true);
	});

	it("propagates rebuilt=false when index reports no-op", async () => {
		const songs: Song[] = [];
		const result = await ensureLibraryIndexUseCase({
			profile: makeProfile(),
			mpdClient: makeMpdClient(songs),
			libraryIndex: makeIndex(false),
		});
		expect(result.rebuilt).toBe(false);
	});
});
