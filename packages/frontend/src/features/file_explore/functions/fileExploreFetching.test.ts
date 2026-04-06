import { create } from "@bufbuild/protobuf";
import { FolderSchema } from "@sola_mpd/shared/src/models/file_explore_pb.js";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../mpd";

import {
	fetchFileExploreFolders,
	fetchFileExploreSongs,
} from "./fileExploreFetching";

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

describe("fetchFileExploreSongs", () => {
	it("should return songs on valid response", async () => {
		const songs = [create(SongSchema, { path: "/music/test.mp3" })];
		const folder = create(FolderSchema, { path: "/music" });
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "listSongsInFolder", value: { songs } },
			}),
		);

		const result = await fetchFileExploreSongs(client, profile, folder);
		expect(result).toHaveLength(1);
		expect(result[0].path).toBe("/music/test.mp3");
	});

	it("should throw on invalid response type", async () => {
		const folder = create(FolderSchema, { path: "/music" });
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(
			fetchFileExploreSongs(client, profile, folder),
		).rejects.toThrow("Invalid MPD response");
	});
});

describe("fetchFileExploreFolders", () => {
	it("should return folders on valid response", async () => {
		const folders = [create(FolderSchema, { path: "/music" })];
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "listAllFolders", value: { folders } },
			}),
		);

		const result = await fetchFileExploreFolders(client, profile);
		expect(result).toHaveLength(1);
		expect(result[0].path).toBe("/music");
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchFileExploreFolders(client, profile)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});
