import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

const isTextToMusicSearchLoadingAtom = atom(true);

export function useIsTextToMusicSearchLoadingState(): boolean {
	return useAtomValue(isTextToMusicSearchLoadingAtom);
}

export function useSetIsTextToMusicSearchLoadingState() {
	const setIsTextToMusicSearchLoading = useSetAtom(
		isTextToMusicSearchLoadingAtom,
	);
	return useCallback(
		(isLoading: boolean) => {
			setIsTextToMusicSearchLoading(isLoading);
		},
		[setIsTextToMusicSearchLoading],
	);
}
