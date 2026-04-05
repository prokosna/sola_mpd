import { atom } from "jotai";

import { vacuumLibrary } from "../../utils/advancedSearchUtils";
import { advancedSearchEndpointAtom } from "../atoms/advancedSearchAtom";
import { advancedSearchClientAtom } from "../atoms/advancedSearchClientAtom";

export const vacuumLibraryActionAtom = atom(null, (get, _set) => {
	const client = get(advancedSearchClientAtom);
	const endpoint = get(advancedSearchEndpointAtom);
	if (endpoint === undefined) {
		return;
	}
	vacuumLibrary(client, endpoint);
});
