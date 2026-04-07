import { create } from "@bufbuild/protobuf";
import {
	AdvancedSearchCommand_TextToMusicType,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import {
	SongListSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { AdvancedSearchClient } from "../services/AdvancedSearchClient";

import { searchSongsByText } from "./textToMusicSearch";

function createMockClient(
	response: Awaited<ReturnType<AdvancedSearchClient["command"]>>,
): AdvancedSearchClient {
	return {
		command: vi.fn().mockResolvedValue(response),
	};
}

const profile = create(MpdProfileSchema, {
	name: "test",
	host: "localhost",
	port: 6600,
});
const endpoint = "http://localhost:8080";

describe("searchSongsByText", () => {
	it("should return songs on valid response", async () => {
		const songs = [
			create(SongSchema, { path: "/a.mp3" }),
			create(SongSchema, { path: "/b.mp3" }),
		];
		const client = createMockClient(
			create(AdvancedSearchResponseSchema, {
				command: {
					case: "textToMusicSearch",
					value: {
						songList: create(SongListSchema, { songs }),
					},
				},
			}),
		);

		const result = await searchSongsByText(
			profile,
			endpoint,
			client,
			"happy music",
			10,
			AdvancedSearchCommand_TextToMusicType.MUQ_MULAN,
		);
		expect(result).toHaveLength(2);
		expect(result[0].path).toBe("/a.mp3");
	});

	it("should return empty array when songList is undefined", async () => {
		const client = createMockClient(
			create(AdvancedSearchResponseSchema, {
				command: {
					case: "textToMusicSearch",
					value: {},
				},
			}),
		);

		const result = await searchSongsByText(
			profile,
			endpoint,
			client,
			"happy music",
			10,
			AdvancedSearchCommand_TextToMusicType.MUQ_MULAN,
		);
		expect(result).toHaveLength(0);
	});

	it("should throw on invalid response type", async () => {
		const client = createMockClient(
			create(AdvancedSearchResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(
			searchSongsByText(
				profile,
				endpoint,
				client,
				"happy music",
				10,
				AdvancedSearchCommand_TextToMusicType.MUQ_MULAN,
			),
		).rejects.toThrow("Invalid AdvancedSearch response");
	});
});
