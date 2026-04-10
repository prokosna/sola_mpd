import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import type { PluginExecuteResponse } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { PluginExecuteResponse_Status } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	type Song,
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";
import type { SubsonicApi } from "../services/SubsonicApi.js";
import type { SubsonicPlaylist, SubsonicSong } from "../types.js";
import { syncWithSubsonic } from "./subsonicUseCases.js";

const createSong = (title: string, artist: string, album: string): Song => {
	return create(SongSchema, {
		metadata: {
			[Song_MetadataTag.TITLE]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: title }),
				},
			}),
			[Song_MetadataTag.ARTIST]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: artist }),
				},
			}),
			[Song_MetadataTag.ALBUM]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: album }),
				},
			}),
		},
	});
};

const createSubsonicApi = (overrides?: Partial<SubsonicApi>): SubsonicApi => ({
	find: vi.fn(),
	getOrCreatePlaylist: vi.fn(),
	add: vi.fn(),
	delete: vi.fn(),
	fetchSongs: vi.fn(),
	...overrides,
});

const playlist: SubsonicPlaylist = { id: "pl-1", name: "Test" };

const collectResponses = async (
	gen: AsyncGenerator<unknown, void, unknown>,
) => {
	const results = [];
	for await (const r of gen) {
		results.push(r);
	}
	return results;
};

describe("syncWithSubsonic", () => {
	it("adds only new songs when existing songs match prefix", async () => {
		const song1 = createSong("A", "Artist1", "Album1");
		const song2 = createSong("B", "Artist2", "Album2");
		const subsonicSong2: SubsonicSong = {
			id: "s2",
			title: "B",
			artist: "Artist2",
			album: "Album2",
		};
		const existingSongs: SubsonicSong[] = [
			{ id: "s1", title: "A", artist: "Artist1", album: "Album1" },
		];

		const client = createSubsonicApi({
			getOrCreatePlaylist: vi.fn().mockResolvedValue(playlist),
			fetchSongs: vi.fn().mockResolvedValue(existingSongs),
			find: vi.fn().mockResolvedValue(subsonicSong2),
			add: vi.fn().mockResolvedValue(undefined),
		});

		const responses = await collectResponses(
			syncWithSubsonic(client, "Test", [song1, song2]),
		);

		expect(client.getOrCreatePlaylist).toHaveBeenCalledTimes(1);
		expect(client.delete).not.toHaveBeenCalled();
		expect(client.find).toHaveBeenCalledTimes(1);
		expect(client.add).toHaveBeenCalledWith(subsonicSong2, playlist);
		expect(responses.length).toBeGreaterThanOrEqual(2);
	});

	it("deletes and recreates playlist when songs don't match", async () => {
		const song1 = createSong("A", "Artist1", "Album1");
		const existingSongs: SubsonicSong[] = [
			{ id: "s1", title: "X", artist: "ArtistX", album: "AlbumX" },
		];
		const newPlaylist: SubsonicPlaylist = { id: "pl-2", name: "Test" };
		const subsonicSong1: SubsonicSong = {
			id: "s-a",
			title: "A",
			artist: "Artist1",
			album: "Album1",
		};

		const client = createSubsonicApi({
			getOrCreatePlaylist: vi
				.fn()
				.mockResolvedValueOnce(playlist)
				.mockResolvedValueOnce(newPlaylist),
			fetchSongs: vi.fn().mockResolvedValue(existingSongs),
			delete: vi.fn().mockResolvedValue(undefined),
			find: vi.fn().mockResolvedValue(subsonicSong1),
			add: vi.fn().mockResolvedValue(undefined),
		});

		const responses = await collectResponses(
			syncWithSubsonic(client, "Test", [song1]),
		);

		expect(client.delete).toHaveBeenCalledWith(playlist);
		expect(client.getOrCreatePlaylist).toHaveBeenCalledTimes(2);
		expect(client.add).toHaveBeenCalledWith(subsonicSong1, newPlaylist);
		const deleteMessage = responses.find(
			(r: PluginExecuteResponse) =>
				typeof r.message === "string" && r.message.includes("Deleting"),
		);
		expect(deleteMessage).toBeDefined();
	});

	it("emits warning when song is not found in Subsonic", async () => {
		const song1 = createSong("Missing", "Artist1", "Album1");

		const client = createSubsonicApi({
			getOrCreatePlaylist: vi.fn().mockResolvedValue(playlist),
			fetchSongs: vi.fn().mockResolvedValue([]),
			find: vi.fn().mockResolvedValue(undefined),
		});

		const responses = await collectResponses(
			syncWithSubsonic(client, "Test", [song1]),
		);

		expect(client.find).toHaveBeenCalledTimes(1);
		expect(client.add).not.toHaveBeenCalled();
		const warnResponse = responses.find(
			(r: PluginExecuteResponse) =>
				r.status === PluginExecuteResponse_Status.WARN,
		);
		expect(warnResponse).toBeDefined();
	});

	it("skips sync when all songs already exist", async () => {
		const song1 = createSong("A", "Artist1", "Album1");
		const existingSongs: SubsonicSong[] = [
			{ id: "s1", title: "A", artist: "Artist1", album: "Album1" },
		];

		const client = createSubsonicApi({
			getOrCreatePlaylist: vi.fn().mockResolvedValue(playlist),
			fetchSongs: vi.fn().mockResolvedValue(existingSongs),
		});

		const responses = await collectResponses(
			syncWithSubsonic(client, "Test", [song1]),
		);

		expect(client.delete).not.toHaveBeenCalled();
		expect(client.find).not.toHaveBeenCalled();
		expect(client.add).not.toHaveBeenCalled();
		expect(responses).toHaveLength(1);
	});
});
