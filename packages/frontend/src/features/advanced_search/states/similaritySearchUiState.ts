import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { similaritySearchSongsAtom } from "./similaritySearchState";

const isSimilaritySearchLoadingAtom = atom((get) => {
	const similaritySearchSongs = get(similaritySearchSongsAtom);
	return similaritySearchSongs?.length === 0;
});

const isSimilaritySearchModalOpenAtom = atom<boolean>(false);

/**
 * Hook for accessing the similarity search loading state.
 *
 * @returns The current similarity search loading state
 */
export function useIsSimilaritySearchLoadingState() {
	return useAtomValue(isSimilaritySearchLoadingAtom);
}

/**
 * Hook for accessing the similarity search modal open state.
 *
 * @returns The current similarity search modal open state
 */
export function useIsSimilaritySearchModalOpenState() {
	return useAtomValue(isSimilaritySearchModalOpenAtom);
}

/**
 * Hook for updating the similarity search modal open state.
 *
 * @returns Memoized open state update function
 */
export function useSetIsSimilaritySearchModalOpenState() {
	const setIsSimilaritySearchModalOpen = useSetAtom(
		isSimilaritySearchModalOpenAtom,
	);
	return useCallback(
		(open: boolean) => {
			setIsSimilaritySearchModalOpen(open);
		},
		[setIsSimilaritySearchModalOpen],
	);
}
