import { useSetAtom } from "jotai";

import { changeCurrentMpdProfileActionAtom } from "../states/actions/changeCurrentMpdProfileActionAtom";

/**
 * Switches the profile this device plays from. The lookup and the write live
 * in the action; this hook exists only so components keep a plain callback.
 */
export function useChangeCurrentMpdProfile() {
	return useSetAtom(changeCurrentMpdProfileActionAtom);
}
