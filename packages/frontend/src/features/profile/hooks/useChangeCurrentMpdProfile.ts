import { useSetAtom } from "jotai";

import { changeCurrentMpdProfileActionAtom } from "../states/actions/changeCurrentMpdProfileActionAtom";

export function useChangeCurrentMpdProfile() {
	return useSetAtom(changeCurrentMpdProfileActionAtom);
}
