import { create } from "@bufbuild/protobuf";
import {
	type MpdRequest,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { MpdClient } from "../../mpd";

import { fetchAllSongsFastChunk } from "./allSongsFastFetch";

function captureMpdClient(): {
	client: MpdClient;
	requests: MpdRequest[];
} {
	const requests: MpdRequest[] = [];
	const client: MpdClient = {
		async command(req: MpdRequest) {
			requests.push(req);
			return create(MpdResponseSchema, {
				command: {
					case: "search",
					value: {
						songs: [create(SongSchema, { path: `/${requests.length}.mp3` })],
					},
				},
			});
		},
		async commandBulk() {
			throw new Error("not used");
		},
	} as unknown as MpdClient;
	return { client, requests };
}

const profile = create(MpdProfileSchema, {
	name: "test",
	host: "localhost",
	port: 6600,
});

describe("fetchAllSongsFastChunk", () => {
	it("issues a search with no conditions, no sort, and an offset window", async () => {
		const { client, requests } = captureMpdClient();

		await fetchAllSongsFastChunk(client, profile, 2000, 1000);

		expect(requests).toHaveLength(1);
		const req = requests[0];
		expect(req.command.case).toBe("search");
		if (req.command.case !== "search") {
			throw new Error("unreachable");
		}
		expect(req.command.value.conditions).toHaveLength(0);
		expect(req.command.value.sort).toBeUndefined();
		expect(req.command.value.window?.start).toBe(2000);
		expect(req.command.value.window?.end).toBe(3000);
	});

	it("returns the songs from the response", async () => {
		const { client } = captureMpdClient();
		const songs = await fetchAllSongsFastChunk(client, profile, 0, 1);
		expect(songs).toHaveLength(1);
		expect(songs[0].path).toBe("/1.mp3");
	});

	it("throws when the response is not a search response", async () => {
		const client: MpdClient = {
			async command() {
				return create(MpdResponseSchema, {
					command: { case: undefined, value: undefined },
				});
			},
			async commandBulk() {
				throw new Error("not used");
			},
		} as unknown as MpdClient;

		await expect(fetchAllSongsFastChunk(client, profile, 0, 1)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});
