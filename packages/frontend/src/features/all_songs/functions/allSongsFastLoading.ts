import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";
import { fetchAllSongsFastChunk } from "./allSongsFastFetch";

export type AllSongsFastProgress = {
	songs: Song[];
	offset: number;
	hasMore: boolean;
};

export type LoadAllSongsFastOptions = {
	mpdClient: MpdClient;
	profile: MpdProfile;
	initialSongs: Song[];
	initialOffset: number;
	chunkSize: number;
	onProgress?: (progress: AllSongsFastProgress) => void;
	fetchChunk?: typeof fetchAllSongsFastChunk;
};

// Drives the chunked `search` window calls until the library is fully loaded.
// `onProgress` is invoked after every chunk so callers can publish the partial
// accumulator (e.g. into a Jotai atom) and the song table can render a growing
// list while remaining pages are still in flight. A short chunk (fewer rows
// than requested) marks the natural end of the result set.
export async function loadAllSongsFast(
	options: LoadAllSongsFastOptions,
): Promise<AllSongsFastProgress> {
	const {
		mpdClient,
		profile,
		initialSongs,
		initialOffset,
		chunkSize,
		onProgress,
		fetchChunk = fetchAllSongsFastChunk,
	} = options;

	let songs = initialSongs;
	let offset = initialOffset;
	let hasMore = true;

	while (hasMore) {
		const chunk = await fetchChunk(mpdClient, profile, offset, chunkSize);
		songs = songs.concat(chunk);
		offset += chunk.length;
		if (chunk.length < chunkSize) {
			hasMore = false;
		}
		onProgress?.({ songs, offset, hasMore });
	}

	return { songs, offset, hasMore };
}
