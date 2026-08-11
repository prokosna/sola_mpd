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

// A short chunk (fewer rows than requested) marks the end of the result set.
// `onProgress` fires after each one so the table can render a growing list
// while the remaining pages are still in flight.
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
