import { useAtomValue, useSetAtom } from "jotai";

import type { ContextMenuItem } from "../../context_menu";
import {
	getSongTableContextMenuSimilarSongs,
	type SongTableContextMenuItemParams,
} from "../../song_table";
import { refreshSimilaritySearchSongsActionAtom } from "../states/actions/refreshSimilaritySearchSongsActionAtom";
import { setIsSimilaritySearchModalOpenActionAtom } from "../states/actions/setIsSimilaritySearchModalOpenActionAtom";
import { setSimilaritySearchTargetSongActionAtom } from "../states/actions/setSimilaritySearchTargetSongActionAtom";
import { advancedSearchStatsAtom } from "../states/atoms/advancedSearchAtom";

export function useSimilarSongsContextMenuItems(): ContextMenuItem<SongTableContextMenuItemParams>[] {
	const advancedSearchStats = useAtomValue(advancedSearchStatsAtom);
	const setSimilaritySearchTargetSong = useSetAtom(
		setSimilaritySearchTargetSongActionAtom,
	);
	const refreshSimilaritySearchSongs = useSetAtom(
		refreshSimilaritySearchSongsActionAtom,
	);
	const setIsSimilaritySearchModalOpen = useSetAtom(
		setIsSimilaritySearchModalOpenActionAtom,
	);

	if (advancedSearchStats === undefined) {
		return [];
	}
	return [
		getSongTableContextMenuSimilarSongs(
			setSimilaritySearchTargetSong,
			refreshSimilaritySearchSongs,
			setIsSimilaritySearchModalOpen,
		),
	];
}
