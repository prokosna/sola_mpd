import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { statsAtom } from "../../../stats/states/atoms/statsAtom";
import { ALL_SONGS_CHUNK_SIZE } from "../../const/allSongsDefaults";
import { loadAllSongsFast } from "../../functions/allSongsFastLoading";
import { allSongsFastStateAtom } from "../atoms/allSongsFastStateAtom";
import { clearAllSongsFastStateActionAtom } from "./clearAllSongsFastStateActionAtom";
import { setAllSongsFastStateActionAtom } from "./setAllSongsFastStateActionAtom";

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

	set(setAllSongsFastStateActionAtom, profile.name, {
		...state,
		isLoading: true,
		error: undefined,
	});

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
				if (get(currentMpdProfileAtom)?.name !== profile.name) {
					return;
				}
				lastProgress = progress;
				set(setAllSongsFastStateActionAtom, profile.name, {
					songs: progress.songs,
					offset: progress.offset,
					isLoading: progress.hasMore,
					hasMore: progress.hasMore,
				});
			},
		});

		if (get(currentMpdProfileAtom)?.name !== profile.name) {
			return;
		}

		// Nothing here can verify the traversal-order assumption the windowed
		// fetch rests on; a count mismatch is the only signal that it broke.
		const stats = get(statsAtom);
		if (stats !== undefined && result.songs.length !== stats.songsCount) {
			console.warn(
				`All Songs progressive load count mismatch: loaded ${result.songs.length}, stats reports ${stats.songsCount}`,
			);
		}
	} catch (e) {
		if (get(currentMpdProfileAtom)?.name === profile.name) {
			set(setAllSongsFastStateActionAtom, profile.name, {
				songs: lastProgress.songs,
				offset: lastProgress.offset,
				isLoading: false,
				hasMore: true,
				error: e instanceof Error ? e.message : String(e),
			});
		}
		throw e;
	} finally {
		// A stale `isLoading: true` would otherwise block every retry once the
		// user switches back to this profile.
		if (get(currentMpdProfileAtom)?.name !== profile.name) {
			set(clearAllSongsFastStateActionAtom, profile.name);
		}
	}
});
