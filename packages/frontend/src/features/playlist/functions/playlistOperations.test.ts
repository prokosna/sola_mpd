import { create } from "@bufbuild/protobuf";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { PlaylistSchema } from "@sola_mpd/shared/src/models/playlist_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../mpd";

import {
	addPlaylist,
	fetchPlaylistSongs,
	fetchPlaylists,
} from "./playlistOperations";

function createMockMpdClient(
	response?: Awaited<ReturnType<MpdClient["command"]>>,
): MpdClient {
	return {
		command: vi.fn().mockResolvedValue(response),
		commandBulk: vi.fn().mockResolvedValue(undefined),
	};
}

const profile = create(MpdProfileSchema, {
	name: "test",
	host: "localhost",
	port: 6600,
});

describe("addPlaylist", () => {
	it("should call commandBulk with save and playlistclear", async () => {
		const client = createMockMpdClient();
		const playlist = create(PlaylistSchema, { name: "My Playlist" });

		await addPlaylist(client, profile, playlist);
		expect(client.commandBulk).toHaveBeenCalledTimes(1);
		const calls = vi.mocked(client.commandBulk).mock.calls[0][0];
		expect(calls).toHaveLength(2);
	});
});

describe("fetchPlaylists", () => {
	it("should return playlists on valid response", async () => {
		const playlists = [create(PlaylistSchema, { name: "Test" })];
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "listplaylists", value: { playlists } },
			}),
		);

		const result = await fetchPlaylists(client, profile);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("Test");
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchPlaylists(client, profile)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});

describe("fetchPlaylistSongs", () => {
	it("should return songs on valid response", async () => {
		const songs = [create(SongSchema, { path: "/playlist.mp3" })];
		const playlist = create(PlaylistSchema, { name: "Test" });
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "listplaylistinfo", value: { songs } },
			}),
		);

		const result = await fetchPlaylistSongs(client, profile, playlist);
		expect(result).toHaveLength(1);
		expect(result[0].path).toBe("/playlist.mp3");
	});

	it("should throw on invalid response type", async () => {
		const playlist = create(PlaylistSchema, { name: "Test" });
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchPlaylistSongs(client, profile, playlist)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});
