import {
	PluginExecuteResponse,
	PluginExecuteResponse_Status,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { getSongMetadataAsString } from "@sola_mpd/domain/src/utils/songUtils.js";

import { AstigaClient } from "./astiga.js";
import { sleep } from "./utils.js";

export async function* syncWithAstiga(
	user: string,
	password: string,
	playlistName: string,
	songs: Song[],
): AsyncGenerator<PluginExecuteResponse, void, unknown> {
	const client = new AstigaClient(user, password);

	yield new PluginExecuteResponse({
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
		yield new PluginExecuteResponse({
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
		yield new PluginExecuteResponse({
			message: `(${index + 1}/${total}) Adding "${title}" to "${playlistName}"`,
			progressPercentage: Math.floor(((index + 1) / total) * 100),
			status: PluginExecuteResponse_Status.OK,
		});

		const astigaSong = await client.find(song);
		if (astigaSong === undefined) {
			yield new PluginExecuteResponse({
				message: `Failed to find "${title}" in Astiga`,
				progressPercentage: Math.floor(((index + 1) / total) * 100),
				status: PluginExecuteResponse_Status.WARN,
			});
			continue;
		}
		await client.add(astigaSong, playlist);
		await sleep(100);
	}
}
