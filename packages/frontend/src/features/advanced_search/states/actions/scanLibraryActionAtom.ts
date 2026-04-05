import { atom } from "jotai";

import { scanLibrary } from "../../utils/advancedSearchUtils";
import { advancedSearchEndpointAtom } from "../atoms/advancedSearchAtom";
import { advancedSearchClientAtom } from "../atoms/advancedSearchClientAtom";

export const scanLibraryActionAtom = atom(null, (get, _set) => {
	const client = get(advancedSearchClientAtom);
	const endpoint = get(advancedSearchEndpointAtom);
	if (endpoint === undefined) {
		return;
	}
	scanLibrary(client, endpoint);
});
