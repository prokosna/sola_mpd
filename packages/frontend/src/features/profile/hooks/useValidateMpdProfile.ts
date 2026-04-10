import { useSetAtom } from "jotai";

import { validateMpdProfileActionAtom } from "../states/actions/validateMpdProfileActionAtom";

export function useValidateMpdProfile() {
	return useSetAtom(validateMpdProfileActionAtom);
}
