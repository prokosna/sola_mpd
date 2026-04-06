import { create } from "@bufbuild/protobuf";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../mpd";

import {
	fetchCurrentSong,
	fetchPlayerStatus,
	fetchPlayerVolume,
} from "./playerFetching";

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

describe("fetchCurrentSong", () => {
	it("should return song on valid response", async () => {
		const song = create(SongSchema, { path: "/test.mp3" });
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "currentsong", value: { song } },
			}),
		);

		const result = await fetchCurrentSong(client, profile);
		expect(result?.path).toBe("/test.mp3");
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchCurrentSong(client, profile)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});

describe("fetchPlayerStatus", () => {
	it("should return status on valid response", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "status", value: { status: {} } },
			}),
		);

		const result = await fetchPlayerStatus(client, profile);
		expect(result).toBeDefined();
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchPlayerStatus(client, profile)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});

describe("fetchPlayerVolume", () => {
	it("should return volume on valid response", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "getvol", value: { vol: 75 } },
			}),
		);

		const result = await fetchPlayerVolume(client, profile);
		expect(result).toBe(75);
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchPlayerVolume(client, profile)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});
