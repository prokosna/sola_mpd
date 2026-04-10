import { create } from "@bufbuild/protobuf";
import { BrowserFilterSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../../mpd";

import { fetchBrowserSongs } from "./browserSongs";

function createMockMpdClient(
	response: Awaited<ReturnType<MpdClient["command"]>>,
): MpdClient {
	return {
		command: vi.fn().mockResolvedValue(response),
		commandBulk: vi.fn(),
	};
}

const profile = create(MpdProfileSchema, {
	name: "test",
	host: "localhost",
	port: 6600,
});

describe("fetchBrowserSongs", () => {
	it("should return songs on valid response", async () => {
		const songs = [
			create(SongSchema, { path: "/a.mp3" }),
			create(SongSchema, { path: "/b.mp3" }),
		];
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "search", value: { songs } },
			}),
		);
		const filters = [
			create(BrowserFilterSchema, {
				tag: Song_MetadataTag.ARTIST,
				selectedValues: [
					create(Song_MetadataValueSchema, {
						value: { case: "stringValue", value: { value: "Test Artist" } },
					}),
				],
				order: 0,
				selectedOrder: 0,
			}),
		];

		const result = await fetchBrowserSongs(client, profile, filters);
		expect(result).toHaveLength(2);
		expect(result[0].path).toBe("/a.mp3");
	});

	it("should return empty array when no filters have selected values", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "search", value: { songs: [] } },
			}),
		);
		const filters = [
			create(BrowserFilterSchema, {
				tag: Song_MetadataTag.ARTIST,
				selectedValues: [],
				order: 0,
				selectedOrder: -1,
			}),
		];

		const result = await fetchBrowserSongs(client, profile, filters);
		expect(result).toHaveLength(0);
		expect(client.command).not.toHaveBeenCalled();
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);
		const filters = [
			create(BrowserFilterSchema, {
				tag: Song_MetadataTag.ARTIST,
				selectedValues: [
					create(Song_MetadataValueSchema, {
						value: { case: "stringValue", value: { value: "Test" } },
					}),
				],
				order: 0,
				selectedOrder: 0,
			}),
		];

		await expect(fetchBrowserSongs(client, profile, filters)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});
