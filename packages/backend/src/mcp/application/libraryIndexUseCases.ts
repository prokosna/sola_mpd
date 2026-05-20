import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../mpd/services/MpdClient.js";
import type { LibraryIndex } from "../services/LibraryIndex.js";

/**
 * Fetches the full song list for the given profile via `listallinfo`, then
 * asks the library index to refresh if the song-list reference has changed.
 *
 * `MpdClient` already caches `listAllSongs` per profile and drops the cache
 * on MPD `database` events, so the index only rebuilds when the upstream
 * songs actually changed — a no-op on most calls.
 */
export const ensureLibraryIndexUseCase = async (input: {
	profile: MpdProfile;
	mpdClient: MpdClient;
	libraryIndex: LibraryIndex;
}): Promise<{ songs: Song[]; rebuilt: boolean }> => {
	const { profile, mpdClient, libraryIndex } = input;
	const request = create(MpdRequestSchema, {
		profile,
		command: { case: "listAllSongs", value: {} },
	});
	const response = await mpdClient.execute(request);
	if (response.command?.case !== "listAllSongs") {
		throw new Error(
			`Unexpected response for listAllSongs: ${response.command?.case ?? "<none>"}`,
		);
	}
	const songs = response.command.value.songs;
	const rebuilt = libraryIndex.refreshIfNeeded(songs);
	return { songs, rebuilt };
};
