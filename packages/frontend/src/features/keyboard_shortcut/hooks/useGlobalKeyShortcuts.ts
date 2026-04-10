import { useSetAtom } from "jotai";

import { togglePauseActionAtom } from "../../player/states/actions/togglePauseActionAtom";

import { useInputKeyCombination } from "./useInputKeyCombination";

export function useGlobalKeyShortcuts(): void {
	const togglePause = useSetAtom(togglePauseActionAtom);

	useInputKeyCombination(undefined, [" "], () => {
		togglePause();
	});
}
