import { create } from "@bufbuild/protobuf";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../mpd";

import { fetchPlayQueueSongs } from "./playQueueFetching";

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

describe("fetchPlayQueueSongs", () => {
	it("should return songs on valid response", async () => {
		const songs = [create(SongSchema, { path: "/queue.mp3" })];
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "playlistinfo", value: { songs } },
			}),
		);

		const result = await fetchPlayQueueSongs(client, profile);
		expect(result).toHaveLength(1);
		expect(result[0].path).toBe("/queue.mp3");
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchPlayQueueSongs(client, profile)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});
