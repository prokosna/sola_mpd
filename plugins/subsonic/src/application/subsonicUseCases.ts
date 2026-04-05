import { create } from "@bufbuild/protobuf";
import {
	type PluginExecuteResponse,
	PluginExecuteResponse_Status,
	PluginExecuteResponseSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { getSongMetadataAsString } from "@sola_mpd/shared/src/utils/songUtils.js";

import { diffSongs } from "../functions/subsonicFunctions.js";
import type { SubsonicApi } from "../services/SubsonicApi.js";

export async function* syncWithSubsonic(
	client: SubsonicApi,
	playlistName: string,
	songs: Song[],
): AsyncGenerator<PluginExecuteResponse, void, unknown> {
	yield create(PluginExecuteResponseSchema, {
		message: "Calculating difference between playlists...",
		progressPercentage: 0,
		status: PluginExecuteResponse_Status.OK,
	});

	// Make sure target playlist existence
	let playlist = await client.getOrCreatePlaylist(playlistName);
	const existingSongs = await client.fetchSongs(playlist);

	// Figure out target songs
	let toAddSongs = diffSongs(songs, existingSongs);
	if (toAddSongs === undefined) {
		yield create(PluginExecuteResponseSchema, {
			message:
				"Existing songs don't match to target songs. Deleting playlist...",
			progressPercentage: 0,
			status: PluginExecuteResponse_Status.OK,
		});
		await client.delete(playlist);
		playlist = await client.getOrCreatePlaylist(playlistName);
		toAddSongs = songs;
	}

	// Sync
	const total = toAddSongs.length;
	for (const [index, song] of toAddSongs.entries()) {
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
	}
}
