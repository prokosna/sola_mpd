import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { statsAtom } from "../../../stats/states/atoms/statsAtom";
import { ALL_SONGS_CHUNK_SIZE } from "../../const/allSongsDefaults";
import { loadAllSongsFast } from "../../functions/allSongsFastLoading";
import { allSongsFastStateAtom } from "../atoms/allSongsFastStateAtom";

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

	let lastProgress = {
		songs: state.songs,
		offset: state.offset,
		hasMore: true,
	};

	try {
		const result = await loadAllSongsFast({
			mpdClient,
			profile,
			initialSongs: state.songs,
			initialOffset: state.offset,
			chunkSize: ALL_SONGS_CHUNK_SIZE,
			onProgress: (progress) => {
				lastProgress = progress;
				set(allSongsFastStateAtom, {
					songs: progress.songs,
					offset: progress.offset,
					isLoading: progress.hasMore,
					hasMore: progress.hasMore,
				});
			},
		});

		// Nothing here can verify the traversal-order assumption the windowed
		// fetch rests on; a count mismatch is the only signal that it broke.
		const stats = get(statsAtom);
		if (stats !== undefined && result.songs.length !== stats.songsCount) {
			console.warn(
				`All Songs progressive load count mismatch: loaded ${result.songs.length}, stats reports ${stats.songsCount}`,
			);
		}
	} catch (e) {
		set(allSongsFastStateAtom, {
			songs: lastProgress.songs,
			offset: lastProgress.offset,
			isLoading: false,
			hasMore: true,
		});
		throw e;
	}
});
