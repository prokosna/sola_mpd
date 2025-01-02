import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchStats } from "../utils/statsUtils";

/**
 * Global state atom for MPD statistics.
 *
 * Fetches and caches MPD server statistics including song,
 * artist, and album counts. Automatically refreshes when
 * dependencies change.
 */
const statsAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileSyncAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchStats(mpdClient, profile);
});

/**
 * Synchronized atom for MPD statistics.
 *
 * Wraps base atom with synchronization capabilities to
 * ensure consistent state across components.
 */
const statsSyncAtom = atomWithSync(statsAtom);

/**
 * Hook to access MPD statistics.
 *
 * Retrieves current statistics from MPD server including
 * total songs, artists, albums, and playtime. Returns
 * undefined while loading.
 *
 * @returns Current statistics
 */
export function useStatsState() {
	return useAtomValue(statsSyncAtom);
}

/**
 * Hook to trigger statistics refresh.
 *
 * Forces a refresh of MPD server statistics, updating
 * all dependent components. Useful after database
 * updates.
 *
 * @returns Refresh function
 */
export function useRefreshStatsState() {
	return useSetAtom(statsAtom);
}
