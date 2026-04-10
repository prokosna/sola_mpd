import { useAtomValue, useSetAtom } from "jotai";

import { refreshSimilaritySearchSongsActionAtom } from "../states/actions/refreshSimilaritySearchSongsActionAtom";
import { setIsSimilaritySearchModalOpenActionAtom } from "../states/actions/setIsSimilaritySearchModalOpenActionAtom";
import { setSimilaritySearchTargetSongActionAtom } from "../states/actions/setSimilaritySearchTargetSongActionAtom";
import { advancedSearchStatsAtom } from "../states/atoms/advancedSearchAtom";

export function useSimilaritySearchContextMenuProps() {
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

	return {
		isAdvancedSearchAvailable: advancedSearchStats !== undefined,
		setSimilaritySearchTargetSong,
		refreshSimilaritySearchSongs,
		setIsSimilaritySearchModalOpen,
	};
}
