import { create } from "@bufbuild/protobuf";
import {
	type PluginExecuteResponse,
	PluginExecuteResponse_Status,
	PluginExecuteResponseSchema,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { getSongMetadataAsString } from "@sola_mpd/domain/src/utils/songUtils.js";

import { SubsonicClient } from "./subsonic.js";
import { sleep } from "./utils.js";

export async function* syncWithSubsonic(
	url: string,
	user: string,
	password: string,
	playlistName: string,
	songs: Song[],
): AsyncGenerator<PluginExecuteResponse, void, unknown> {
	const client = new SubsonicClient(url, user, password);

	yield create(PluginExecuteResponseSchema, {
		message: "Calculating difference between playlists...",
		progressPercentage: 0,
		status: PluginExecuteResponse_Status.OK,
	});

	// Make sure target playlist existence
	let playlist = await client.getOrCreatePlaylist(playlistName);
	const existingSongs = await client.fetchSongs(playlist);

	// Figure out target songs
	let diffSongs = client.diff(songs, existingSongs);
	if (diffSongs === undefined) {
		yield create(PluginExecuteResponseSchema, {
			message:
				"Existing songs don't match to target songs. Deleting playlist...",
			progressPercentage: 0,
			status: PluginExecuteResponse_Status.OK,
		});
		await client.delete(playlist);
		playlist = await client.getOrCreatePlaylist(playlistName);
		diffSongs = songs;
	}

	// Sync
	const total = diffSongs.length;
	for (const [index, song] of diffSongs.entries()) {
		const title = getSongMetadataAsString(song, Song_MetadataTag.TITLE);
		yield create(PluginExecuteResponseSchema, {
			message: `(${index + 1}/${total}) Adding "${title}" to "${playlistName}"`,
			progressPercentage: Math.floor(((index + 1) / total) * 100),
			status: PluginExecuteResponse_Status.OK,
		});

		const subsonicSong = await client.find(song);
		if (subsonicSong === undefined) {
			yield create(PluginExecuteResponseSchema, {
				message: `Failed to find "${title}" in Subsonic`,
				progressPercentage: Math.floor(((index + 1) / total) * 100),
				status: PluginExecuteResponse_Status.WARN,
			});
			continue;
		}
		await client.add(subsonicSong, playlist);
		await sleep(100);
	}
}
