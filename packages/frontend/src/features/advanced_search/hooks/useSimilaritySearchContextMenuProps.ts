import { useAdvancedSearchStatsState } from "../states/advancedSearchState";
import {
	useRefreshSimilaritySearchSongsState,
	useSetSimilaritySearchTargetSongState,
} from "../states/similaritySearchState";
import { useSetIsSimilaritySearchModalOpenState } from "../states/similaritySearchUiState";

/**
 * Hook for similarity search context menu props.
 *
 * @returns Similarity search context menu props
 */
export function useSimilaritySearchContextMenuProps() {
	const advancedSearchStats = useAdvancedSearchStatsState();
	const setSimilaritySearchTargetSong = useSetSimilaritySearchTargetSongState();
	const refreshSimilaritySearchSongs = useRefreshSimilaritySearchSongsState();
	const setIsSimilaritySearchModalOpen =
		useSetIsSimilaritySearchModalOpenState();

	return {
		isAdvancedSearchAvailable: advancedSearchStats !== undefined,
		setSimilaritySearchTargetSong,
		refreshSimilaritySearchSongs,
		setIsSimilaritySearchModalOpen,
	};
}
