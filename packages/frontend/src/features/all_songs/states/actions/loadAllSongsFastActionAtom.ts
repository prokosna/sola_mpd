import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { statsAtom } from "../../../stats/states/atoms/statsAtom";
import { ALL_SONGS_CHUNK_SIZE } from "../../const/allSongsDefaults";
import { fetchAllSongsFastChunk } from "../../functions/allSongsFastFetch";
import { allSongsFastStateAtom } from "../atoms/allSongsFastStateAtom";

/**
 * Drive the chunk loop until the library is fully loaded. Each chunk is
 * appended in-place so the song table can render a growing list while the
 * remaining pages are still in flight. A short chunk (fewer rows than
 * requested) marks the natural end of the result set.
 */
export const loadAllSongsFastActionAtom = atom(null, async (get, set) => {
	const state = get(allSongsFastStateAtom);
	if (state.isLoading || !state.hasMore) {
		return;
	}

	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (profile === undefined) {
		return;
	}

	set(allSongsFastStateAtom, { ...state, isLoading: true });

	let songs = state.songs;
	let offset = state.offset;
	let hasMore = true;

	try {
		while (hasMore) {
			const chunk = await fetchAllSongsFastChunk(
				mpdClient,
				profile,
				offset,
				ALL_SONGS_CHUNK_SIZE,
			);
			songs = songs.concat(chunk);
			offset += chunk.length;
			if (chunk.length < ALL_SONGS_CHUNK_SIZE) {
				hasMore = false;
			}
			// Publish the partial accumulator so the table renders progressively
			// instead of waiting for the final chunk.
			set(allSongsFastStateAtom, {
				songs,
				offset,
				isLoading: hasMore,
				hasMore,
			});
		}

		// We rely on MPD's natural traversal order rather than an explicit sort,
		// which means a buggy or non-deterministic server iteration could drop or
		// duplicate rows across windows. Cross-check against `stats songs_count`
		// so the discrepancy is visible even in production.
		const stats = get(statsAtom);
		if (stats !== undefined && songs.length !== stats.songsCount) {
			console.warn(
				`All Songs progressive load count mismatch: loaded ${songs.length}, stats reports ${stats.songsCount}`,
			);
		}
	} catch (e) {
		set(allSongsFastStateAtom, {
			songs,
			offset,
			isLoading: false,
			hasMore: true,
		});
		throw e;
	}
});
